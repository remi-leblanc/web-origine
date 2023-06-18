<?php

namespace App\Entity;

use App\Repository\TokenRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TokenRepository::class)]
class Token
{
	#[ORM\Id]
	#[ORM\GeneratedValue]
	#[ORM\Column]
	private ?int $id = null;

	#[ORM\Column(length: 255)]
	private ?string $name = null;

	#[ORM\Column]
	private ?int $type = null;

	#[ORM\Column(length: 255)]
	private ?string $headerKey = null;

	#[ORM\Column(length: 255)]
	private ?string $headerValue = null;

	#[ORM\Column(type: Types::DATETIME_MUTABLE)]
	private ?\DateTimeInterface $updatedAt = null;

	#[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
	private ?\DateTimeInterface $expiresAt = null;

	public function getId(): ?int
	{
		return $this->id;
	}

	public function getName(): ?string
	{
		return $this->name;
	}

	public function setName(string $name): self
	{
		$this->name = $name;

		return $this;
	}

	public function getHeaderKey(): ?string
	{
		return $this->headerKey;
	}

	public function setHeaderKey(string $headerKey): self
	{
		$this->headerKey = $headerKey;

		return $this;
	}

	public function getHeaderValue(): ?string
	{
		return $this->headerValue;
	}

	public function setHeaderValue(string $headerValue): self
	{
		$this->headerValue = $headerValue;

		return $this;
	}

	public function getUpdatedAt(): ?\DateTimeInterface
	{
		return $this->updatedAt;
	}

	public function setUpdatedAt(\DateTimeInterface $updatedAt): self
	{
		$this->updatedAt = $updatedAt;

		return $this;
	}

	public function getType(): ?int
	{
		return $this->type;
	}

	public function setType(int $type): self
	{
		$this->type = $type;

		return $this;
	}

	public function getExpiresAt(): ?\DateTimeInterface
	{
		return $this->expiresAt;
	}

	public function setExpiresAt(?\DateTimeInterface $expiresAt): self
	{
		$this->expiresAt = $expiresAt;

		return $this;
	}
}
