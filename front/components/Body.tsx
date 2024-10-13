import { useState, useEffect, useRef } from "react"
import Header from "./Header";
import Hero from "./Hero";
import Loading from "./Card/Loading";
import Button from "./Button";

export default function () {

	return (
		<div>
			<Header />
			<div className="mt-8 mb-10 px-8">
				<Hero />
			</div>
			<div className="flex flex-col items-center w-full px-4">
				<Button />
			</div>
		</div>
	);

}
