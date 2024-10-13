import { useState, useEffect, useRef } from "react"
import Header from "./Header";
import Body from "./Body";

export default function () {

	return (
		<div className="relative w-96 h-[32rem] font-display">
			<div className="absolute inset-0 bg-mesh-gradient opacity-30"></div>
			<div className="drawer">
				<input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
				<div className="drawer-content flex flex-col">
					<Body />
				</div>
				<div className="drawer-side">
					<label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
					<ul className="menu p-4 w-80 min-h-full bg-base-200">
						{/* Sidebar content here */}
						<li><a>Sidebar Item 1</a></li>
						<li><a>Sidebar Item 2</a></li>
					</ul>
				</div>
			</div>
		</div>
	);

}
