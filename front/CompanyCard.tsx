import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import anime from 'animejs/lib/anime.es.js'
import colors from 'tailwindcss/colors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faCircleUser } from '@fortawesome/free-solid-svg-icons'

const CompanyCard = (props) => {

	const addressSection = () => {
		if (props.data.address) {
			return (
				<div id="addressSection" className="mb-4 opacity-0">
					<h2 className="text-lg font-extrabold mx-3 mb-1"><FontAwesomeIcon icon={faLocationDot} className="mr-1" />Siège</h2>
					<div className="relative mb-4 overflow-hidden">
						<div className="relative flex flex-col items-end z-10 p-4">
							<span className="text-xs font-light">{props.data.address.number} {props.data.address.streetType} {props.data.address.streetName}</span>
							<span className="text-base font-extrabold">{props.data.address.city}</span>
							<span className="text-base font-light">{props.data.address.postalCode}</span>
						</div>
						<div className="absolute w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
							<div className="bg-gradient-multi from-transparent to-secondary absolute inset-0 z-10"></div>
							<img className="w-full" src={chrome.runtime.getURL("assets/images/regions/" + props.data.address.regionCode + ".jpg")} />
						</div>
					</div>
				</div>
			)
		}
	}

	const ownerSection = () => {
		if (props.data.owner) {
			return (
				<div id="ownerSection" className="mx-4 opacity-0">
					<h2 className="text-lg font-extrabold"><FontAwesomeIcon icon={faCircleUser} className="mr-1" />Gérant(s)</h2>
					<div className="text-xl">
						<span className="font-light">{props.data.owner.firstName} </span>
						<span className="font-extrabold">{props.data.owner.lastName}</span>
					</div>
				</div>
			)
		}
	}

	useEffect(() => {
		anime.timeline({
			duration: 3000,
		})
			.add({
				targets: '#companyCard',
				opacity: 1,
				translateY: ['15px', '0'],
				easing: 'easeInOutQuad',
				duration: 400,
			})
			.add({
				targets: '#companySection',
				opacity: 1,
				easing: 'easeInOutQuad',
				duration: 200,
			})
			.add({
				targets: '#addressSection',
				opacity: 1,
				easing: 'easeInOutQuad',
				duration: 200,
			})
			.add({
				targets: '#ownerSection',
				opacity: 1,
				easing: 'easeInOutQuad',
				duration: 200,
			})
	}, [])

	return (
		<div id="companyCard" className="bg-secondary rounded-t-3xl rounded-b-lg py-5 text-primary opacity-0">
			<div id="companySection" className="text-center mb-4 opacity-0">
				<span className="text-xs">{props.data.company.website}</span>
				<h1 className="text-3xl font-extrabold">{props.data.company.name}</h1>
				<div className="opacity-40">
					<span className="text-xs font-light mr-1">SIREN</span>
					<span className="text-xs font-extrabold">{props.data.company.siren}</span>
				</div>
			</div>
			{addressSection()}
			{ownerSection()}
		</div>
	)
}

export default CompanyCard
