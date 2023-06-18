import { useState, useEffect, useRef } from "react"
import axios from "axios"
import anime from 'animejs/lib/anime.es.js'

import "./style.css"
import CompanyCard from "./CompanyCard";
import StartButton from "./StartButton";

function IndexPopup() {

	const [tabUrl, setTabUrl] = useState(null);

	const [data, setData] = useState(null);
	const [companyCard, setCompanyCard] = useState(null);

	const startButton = useRef(null);

	async function startCheck() {
		let queryOptions = { active: true, lastFocusedWindow: true };
		// `tab` will either be a `tabs.Tab` instance or `undefined`.
		let [tab] = await chrome.tabs.query(queryOptions);
		setTabUrl(tab.url);
	}

	useEffect(() => {
		if (tabUrl) {
			axios.post("http://localhost:3000/api/checkcompany/fr", {
				url: tabUrl
			})
				.then(function (response) {
					setTimeout(() => {
						setData(response.data.data)
						if(response.data.code == 200){
							startButton.current.Valid().then(() => {
								anime({
									targets: '#popupContainer',
									height: 500,
									easing: 'easeInOutQuad',
									duration: 300,
									complete: () => {
										setCompanyCard(<CompanyCard data={response.data.data}/>)
									}
								})
							})
						} else if(response.data.code == 500){
							startButton.current.Error()
						} else {
							startButton.current.Unknow()
						}
						
					}, 1000)
				})
				.catch((e) => {
					console.log(e)
				})
		}
	}, [tabUrl])

	return (
		<div className="w-96">
			<div id="popupContainer" className="p-8">
				<StartButton click={startCheck} ref={startButton} />
				{companyCard}
			</div>
			<div className="h-1 w-full gradient-france"></div>
		</div>
	)
}

export default IndexPopup
