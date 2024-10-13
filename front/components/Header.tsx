import { useState, useEffect, useRef } from "react"

export default function () {

	return (
		<div className="navbar min-h-0 bg-base-100/40 backdrop-blur-lg">
			<div className="flex-none">
				<label htmlFor="my-drawer-3" aria-label="open sidebar" className="">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
				</label>
			</div>
			<div className="flex-1 flex justify-center">
				<a className="font-semibold text-lg">WebOrigine</a>
			</div>
			<div className="flex-none">
				<button className="">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
				</button>
			</div>
		</div>
	);

}
