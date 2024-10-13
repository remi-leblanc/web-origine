import { useState, useEffect, useRef } from "react"
import { useAnimate, motion } from "framer-motion"

export default function (props) {

	return (
		<motion.div className="text-base-100">
			<div className="text-center my-5">
				<p className="text-sm font-normal">{props.data.url}</p>
			</div>
			<div className="my-4">
				<div className="flex items-center text-base font-semibold mb-2">
					<span className="shrink-0">Causes possibles</span>
					<div className="wo-divider wo-divider-left ml-5"></div>
				</div>
				<ul className="list-disc text-sm">
					<li>L’entreprise n’est pas française</li>
					<li>Le site n’est pas conforme aux lois Européenes</li>
					<li>Site non pris en charge par WebOrigine</li>
				</ul>
			</div>
		</motion.div>
	);

}
