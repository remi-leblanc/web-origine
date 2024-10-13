import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function () {

	const maskSteps = [
		"radial-gradient(50px at 51% 13%, black, rgba(0, 0, 0, 0))",
		"radial-gradient(50px at 12% 34%, black, rgba(0, 0, 0, 0))",
		"radial-gradient(50px at 32% 80%, black, rgba(0, 0, 0, 0))",
		"radial-gradient(50px at 80% 80%, black, rgba(0, 0, 0, 0))",
		"radial-gradient(50px at 81% 31%, black, rgba(0, 0, 0, 0))",
	]

	const maskAnim = {
		animate: {
			maskImage: [...maskSteps, maskSteps[0]],
			WebkitMaskImage: [...maskSteps, maskSteps[0]],
		},
		transition: { repeat: Infinity, duration: 8, ease: "linear" }
	}

	return (
		<div className="relative w-full h-full">
			<motion.img className="absolute left-1/2 -translate-x-1/2 h-full" src={chrome.runtime.getURL("assets/images/france-map/stroke-light.png")}
				{...maskAnim}
			/>
			<img className="absolute left-1/2 -translate-x-1/2 h-full" src={chrome.runtime.getURL("assets/images/france-map/stroke.png")} />
			<img className="absolute left-1/2 -translate-x-1/2 h-full" src={chrome.runtime.getURL("assets/images/france-map/bg-light.png")} />
			<motion.img className="absolute left-1/2 -translate-x-1/2 h-full" src={chrome.runtime.getURL("assets/images/france-map/inner-light.png")}
				initial={{ opacity: 0.2 }}
				animate={{ opacity: 1 }}
				transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }}
			/>
			<motion.img className="absolute left-1/2 -translate-x-1/2 h-full opacity-50" src={chrome.runtime.getURL("assets/images/france-map/thick-light.png")}
				{...maskAnim}
			/>
		</div>
	);
}