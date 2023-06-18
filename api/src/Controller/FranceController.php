<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Persistence\ManagerRegistry;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\Panther\Client;

use App\Entity\Company;
use App\Repository\CompanyRepository;
use App\Entity\Address;
use App\Repository\AddressRepository;
use App\Entity\Person;
use App\Entity\Token;
use App\Repository\PersonRepository;
use App\Repository\TokenRepository;

#[Route('/api')]
class FranceController extends AbstractController
{

	const LEGAL_LINK_TEXTCONTENT_SCOPE = [
		'Mentions légales',
		'Infos légales',
		'CGU'
	];

	private $httpClient;
	private $scrapClient;

	private $companyRepository;
	private $addressRepository;
	private $personRepository;

	private $em;

	private $authToken;

	private $websiteHost;

    public function __construct(
		HttpClientInterface $httpClient,
		CompanyRepository $companyRepository,
		AddressRepository $addressRepository,
		PersonRepository $personRepository,
		TokenRepository $tokenRepository,
		ManagerRegistry $doctrine)
	{
        $this->httpClient = $httpClient;

		$this->companyRepository = $companyRepository;
		$this->addressRepository = $addressRepository;
		$this->personRepository = $personRepository;

		$this->em = $doctrine->getManager();
		
		$this->authToken = $tokenRepository->findOneBy(['name' => 'sirene', 'type' => TokenRepository::TYPE_AUTH]);
		$genToken = $tokenRepository->findOneBy(['name' => 'sirene', 'type' => TokenRepository::TYPE_TOKENGEN]);
		$now = new \DateTime();
		$diffHours = ($this->authToken->getExpiresAt()->getTimestamp() - $now->getTimestamp()) / 3600;
		if(!$this->authToken || $diffHours <= 1){
			$tokenData = json_decode($this->httpClient->request('POST', 'https://api.insee.fr/token', [
				'body' => [
					'grant_type' => 'client_credentials'
				],
				'headers' => [
					$genToken->getHeaderKey() => $genToken->getHeaderValue()
				],
			])->getContent());

			if(!$this->authToken){
				$this->authToken = new Token();
				$this->authToken->setName('sirene');
				$this->authToken->setHeaderKey('Authorization');
				$this->authToken->setType(TokenRepository::TYPE_AUTH);
			}
			
			$this->authToken->setHeaderValue($tokenData->token_type . " " . $tokenData->access_token);
			$this->authToken->setUpdatedAt($now);
			$now->modify('+ '.$tokenData->expires_in.' seconds');
			$this->authToken->setExpiresAt($now);
			$tokenRepository->save($this->authToken, true);
		}
    }

	#[Route('/companycheck/fr', name: 'company_check_fr', methods: ['POST'])]
    public function companyCheck(Request $request)
    {
		$response = [];
		$tabUrl = $request->request->get('url');

		if(!$tabUrl){
			$response = [
				'code' => '400',
				'message' => 'You must provide an URL parameter'
			];
			return new JsonResponse($response);
		}

		$this->websiteHost = parse_url($tabUrl, PHP_URL_HOST);
		
		$existingCompany = $this->companyRepository->findOneBy(['website' => $this->websiteHost]);
		if($existingCompany){
			$response = [
				'code' => '200',
				'data' => $this->formatResponseData($existingCompany)
			];
			return new JsonResponse($response);
		}

		$baseUrl = "https://".$this->websiteHost."/";
		$baseHtml = null;
		$legalUrl = null;

		//In some cases the footer is loaded after page load with AJAX, so here we use the Panther lib to wait for it.
		//We must use a try-catch-finally to close the browser at the end
		try {
			$scrapClient = Client::createChromeClient(__DIR__.'/../../drivers/chromedriver');
			$scrapClient->request('GET', $baseUrl);
			$crawler = $scrapClient->waitFor('footer');
			$baseHtml = $crawler->html();

			//Searching the link to the legal page by text content
			foreach(self::LEGAL_LINK_TEXTCONTENT_SCOPE as $name){
				$legalLink = $crawler->selectLink($name);
				if($legalLink->count()){
					$legalUrl = $legalLink->link()->getUri();
					break;
				}
			}
		} catch (\Exception $e) {
			echo $e->getMessage();
		} finally {
			echo 'test';
			$scrapClient->close();
			$scrapClient->quit();
		}

		//If we found a link to a legal page, we more likely will be able to find a SIREN on this page.
		if($legalUrl){
			$legalHtml = $this->httpClient->request('GET', $legalUrl)->getContent();
			$siren = $this->findSirenInHtml($legalHtml, $this->websiteHost);
		} else {
			$siren = $this->findSirenInHtml($baseHtml, $this->websiteHost);
		}

		if(!$siren) {
			$response = [
				'code' => '400',
				'message' => 'SIREN not found'
			];
			return new JsonResponse($response);
		}

		$inseeResult = $this->callInseeApi($siren);
		if(!$inseeResult){
			$response = [
				'code' => '400',
				'message' => 'Error while fetching Insee API'
			];
			return new JsonResponse($response);
		}

		$createdAt = new \DateTime();

		$company = $this->createCompany($inseeResult, $createdAt);
		$address = $this->createAddress($inseeResult, $createdAt);
		if($address){
			$company->addAddress($address);
		}
		$person = $this->createPerson($inseeResult, $createdAt);
		if($person){
			$company->addOwner($person);
		}
		
		$this->em->flush();
		
		$responseData = $this->formatResponseData($company);

		$response = [
			'code' => '200',
			'data' => $responseData
		];

        return new JsonResponse($response);
    }

	private function callInseeApi($siren) {
		$inseeResult = json_decode($this->httpClient->request('GET', 'https://api.insee.fr/entreprises/sirene/V3/siret', [
			'query' => [
				'q' => 'siren:'.$siren.' AND etablissementSiege:true'
			],
			'headers' => [
				$this->authToken->getHeaderKey() => $this->authToken->getHeaderValue()
			],
		])->getContent());

		if(!$inseeResult){
			return false;
		}

		return $inseeResult;
	}

	private function formatResponseData(Company $company) {
		$responseData = [
			'companySiren' => $company->getSiren(),
			'companySiret' => $company->getSiret(),
			'companyName' => $company->getName()
		];

		$address = $company->getAddresses()[0];
		$owner = $company->getOwners()[0];

		if($address){
			$responseData['addrNum'] = $address->getNumber();
			$responseData['addrStreetType'] = $address->getStreetType();
			$responseData['addrStreetName'] = $address->getStreetName();
			$responseData['addrCity'] = $address->getCity();
			$responseData['addrPostalCode'] = $address->getPostalCode();
		}
		if($owner){
			$responseData['ownerFirstName'] = $owner->getFirstName();
			$responseData['ownerLastName'] = $owner->getLastName();
		}
		return $responseData;
	}

	private function createAddress($inseeApiData, \DateTime $createdAt){
		$shop = $inseeApiData->etablissements[0];
		$shopAddress = $shop->adresseEtablissement;

		$addressData = [
			'streetName' => $shopAddress->libelleVoieEtablissement,
			'city' => $shopAddress->libelleCommuneEtablissement,
			'postalCode' => $shopAddress->codePostalEtablissement
		];

		if($this->containsNull($addressData)){
			return false;
		}

		//Can be null but if not it's mandatory.
		$addressData['number'] = $shopAddress->numeroVoieEtablissement;
		$addressData['streetType'] = $shopAddress->typeVoieEtablissement;

		$existingAddress = $this->addressRepository->findOneBy($addressData);
		if($existingAddress){
			return $existingAddress;
		}

		$newAddress = new Address();
		$newAddress->setNumber($addressData['number']);
		$newAddress->setStreetType($addressData['streetType']);
		$newAddress->setStreetName($addressData['streetName']);
		$newAddress->setCity($addressData['city']);
		$newAddress->setPostalCode($addressData['postalCode']);
		$newAddress->setCreatedAt($createdAt);
		
		$this->em->persist($newAddress);

		return $newAddress;
	}

	private function createPerson($inseeApiData, \DateTime $createdAt){
		$shop = $inseeApiData->etablissements[0];

		if(!$ownerFirstName = $shop->uniteLegale->prenomUsuelUniteLegale){
			$ownerFirstName = $shop->uniteLegale->prenom1UniteLegale;
		}
		if(!$ownerLastName = $shop->uniteLegale->nomUsageUniteLegale){
			$ownerLastName = $shop->uniteLegale->nomUniteLegale;
		}

		$personData = [
			'firstName' => $ownerFirstName,
			'lastName' => $ownerLastName,
		];

		if($this->containsNull($personData)){
			return false;
		}

		$existingPerson = $this->personRepository->findOneBy($personData);
		if($existingPerson){
			return $existingPerson;
		}

		$newPerson = new Person();
		$newPerson->setFirstName($personData['firstName']);
		$newPerson->setLastName($personData['lastName']);
		$newPerson->setCreatedAt($createdAt);
		$newPerson->setUpdatedAt($createdAt);

		$this->em->persist($newPerson);

		return $newPerson;
	}

	private function createCompany($inseeApiData, \DateTime $createdAt){
		$shop = $inseeApiData->etablissements[0];

		if(!$companyName = $shop->uniteLegale->denominationUniteLegale){
			$companyName = $shop->periodesEtablissement[0]->enseigne1Etablissement;
		}

		$companyData = [
			'siren' => $shop->siren,
			'siret' => $shop->siret,
			'name' => $companyName,
			'country' => 'FR',
			'website' => $this->websiteHost
		];

		if($this->containsNull($companyData)){
			return false;
		}

		$existingCompany = $this->companyRepository->findOneBy($companyData);
		if($existingCompany){
			return $existingCompany;
		}

		$newCompany = new Company();
		$newCompany->setSiren($companyData['siren']);
		$newCompany->setSiret($companyData['siret']);
		$newCompany->setName($companyData['name']);
		$newCompany->setCountry($companyData['country']);
		$newCompany->setWebsite($companyData['website']);
		$newCompany->setCreatedAt($createdAt);
		$newCompany->setUpdatedAt($createdAt);

		$this->em->persist($newCompany);

		return $newCompany;
	}

	private function containsNull($array) {
		foreach($array as $val) {
			if($val == null){
				return true;
			}
		}
	}

	private function findSirenInHtml($html, $host) {
		$crawler = new Crawler($html);
		$crawler = $crawler->filter('p, li');

		$hostParts = explode('.', $host);
		$sirenOptions = [];
		$sirenHint = 0;
		foreach($crawler as $el) {
			
			// Check full host: (www.)example.com
			if(str_contains(strtolower($el->textContent), $host)){
				$sirenHint++;
			}

			// Check host name: example
			if(str_contains(strtolower($el->textContent), $hostParts[count($hostParts)-2])){
				$sirenHint++;
			}

			// Check main host without spaces: thisisanexample(.com)
			if(str_contains(str_replace(' ', '', strtolower($el->textContent)), $hostParts[count($hostParts)-2])){
				$sirenHint++;
			}

			if(preg_match('/(?<!(FR)|\d)\d{3} ?\d{3} ?\d{3}(?!€|( ?euros?))/i', $el->textContent, $matches)){
				$sirenOptions[] = [
					'siren' => str_replace(' ', '', $matches[0]),
					'hint' => $sirenHint
				];
				$sirenHint = 0;
			}
		}
		if(empty($sirenOptions)){
			return false;
		}
		array_multisort($sirenOptions, SORT_DESC);
		return $sirenOptions[0]['siren'];
	}
}