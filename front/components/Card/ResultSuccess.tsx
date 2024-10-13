import { useState, useEffect, useRef } from "react"
import { useAnimate, motion } from "framer-motion"

export default function (props) {

	const parent = {
		visible: {
			transition: {
				when: "beforeChildren",
				staggerChildren: 0.3,
			},
		},
		hidden: {
			transition: {
				when: "afterChildren",
			},
		},
	}

	const item = {
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5
			}
		},
		hidden: { 
			opacity: 0,
			y: 10,
			transition: {
				duration: 0.5
			}
		},
	}

	const Company = () => {
		if (!props.data.data.company) {
			return;
		}
		return (
			<motion.div variants={item} className="text-center my-5">
				<p className="text-sm font-normal">{props.data.url}</p>
				<p className="text-2xl font-bold">{props.data.data.company.name}</p>
				<p className="text-sm uppercase">
					<span className="font-normal">Siren </span>
					<span className="font-semibold">{props.data.data.company.siren}</span>
				</p>
			</motion.div>
		)
	}

	const Address = () => {
		if (!props.data.data.address) {
			return;
		}
		return (
			<motion.div variants={item} className="bg-base-100/20 ring-2 ring-offset-0 ring-base-100/20 ring-inset rounded-3xl px-8 py-4 my-4">
				<p className="text-base font-semibold mb-2">Siège</p>
				<div>
					<p className="font-normal">{props.data.data.address.streetType} {props.data.data.address.streetName}</p>
					<p className="font-normal">{props.data.data.address.city}</p>
					<p className="font-normal">{props.data.data.address.postalCode}</p>
				</div>
			</motion.div>
		)
	}

	const Owners = () => {
		if (!props.data.data.owners) {
			return;
		}
		return (
			<motion.div variants={item} className="bg-base-100/20 ring-2 ring-offset-0 ring-base-100/20 ring-inset p-5 my-4">
				<p className="text-base font-semibold mb-2">Gérant(s)</p>
				<div>
					<span className="font-normal">{props.data.data.owners.firstName} {props.data.data.owners.lastName}</span>
				</div>
			</motion.div>
		)
	} 

	return (
		<motion.div initial="hidden" animate="visible" variants={parent} className="text-base-100">

			<Company />
			<Address />
			<Owners />

		</motion.div>
	);

}
