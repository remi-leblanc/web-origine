import { useState, useEffect, useRef } from "react"
import { useAnimate, motion, useSpring, useMotionTemplate } from "framer-motion"
import axios from "axios"

export default function () {

	const [state, setState] = useState(0);
	const [data, setData] = useState();

	const [button, buttonAnimate] = useAnimate();
	const [content, contentAnimate] = useAnimate();
	const [icon, iconAnimate] = useAnimate();
	const [blue, blueAnimate] = useAnimate();

	const openAnimation = async () => {
		await iconAnimate(icon.current, {
			opacity: 0
		}, {
			duration: 0.3,
			ease: [0.33, 1, 0.68, 1]
		})
		await blueAnimate(blue.current, {
			width: 40
		}, {
			duration: 0.3,
			ease: [0.33, 1, 0.68, 1]
		})
		await blueAnimate(blue.current, {
			scale: 1.5
		}, {
			duration: 0.3,
			ease: [0.33, 1, 0.68, 1]
		})
		await blueAnimate(blue.current, {
			scale: 0.6
		}, {
			duration: 0.3,
			ease: [0.33, 1, 0.68, 1]
		})
		await contentAnimate(content.current, {
			width: "auto"
		}, {
			duration: 0.3,
			ease: [0.33, 1, 0.68, 1]
		})
		await contentAnimate(content.current, {
			opacity: 1
		}, {
			duration: 0.3,
			ease: [0.33, 1, 0.68, 1]
		})
		//await buttonAnimate(button.current, {
		//	width: "40px",
		//}, {
		//	duration: 0.3,
		//	ease: [.42, .22, .21, 1]
		//})
		//await blueAnimate(blue.current, {
		//	scale: 1.2,
		//}, {
		//	duration: 0.5,
		//	ease: [0.33, 1, 0.68, 1]
		//})
		//await changeContent(() => {
		//	setState(1);
		//});
		//await blueAnimate(blue.current, {
		//	scale: 1,
		//	inset: '5px'
		//}, {
		//	duration: 0.5,
		//	ease: [0.33, 1, 0.68, 1]
		//})
	}

	const changeContent = async (callback) => {
		iconAnimate(icon.current, {
			opacity: 0
		}, {
			duration: 0.1
		})
		await contentAnimate(content.current, {
			opacity: 0
		}, {
			duration: 0.1
		})
		callback();
		iconAnimate(icon.current, {
			opacity: 1
		}, {
			duration: 0.1
		})
		contentAnimate(content.current, {
			opacity: 1
		}, {
			duration: 0.1
		})
	}

	const handleClick = async () => {
		if (state != 0) {
			return;
		}
		await openAnimation();

		let queryOptions = { active: true, lastFocusedWindow: true };
		// `tab` will either be a `tabs.Tab` instance or `undefined`.
		let [tab] = await chrome.tabs.query(queryOptions);

		axios.post("http://localhost:3000/api/checkcompany/fr", {
			url: tab.url
		})
			.then(function (response) {
				setTimeout(() => {
					//if (response.data.code == 200) {
					//	changeContent(() => {
					//		setState(2);
					//		setData(response.data);
					//	});
					//} else if (response.data.code == 500) {
					//	changeContent(() => {
					//		setState(4);
					//		setData(response.data);
					//	});
					//} else {
					//	changeContent(() => {
					//		setState(3);
					//		setData(response.data);
					//	});
					//}

				}, 1000)
			})
			.catch((e) => {
				console.log(e)
			})
	}

	const Content = () => {
		switch (state) {
			case 0:
				return <span>Vérifier ce site</span>;
			case 1:
				return <span>Analyse en cours</span>;
			case 2:
				return;
			case 3:
				return;
			case 4:
				return;
		}
	}

	const Icon = () => {
		switch (state) {
			case 0:
				return <span>Vérifier ce site</span>;
			case 1:
				return;
			case 2:
				return;
			case 3:
				return;
			case 4:
				return;
		}
	}

	function handleMouseEnter(event) {

	}

	function handleMouseMove(event) {

	}

	function handleMouseLeave(event) {

	}

	return (
		<motion.div
			layout
			onClick={handleClick}
			className="flex relative text-sm text-center font-semibold bg-base-200 rounded-full cursor-pointer"
			ref={button}
			data-state={state}
			onMouseEnter={handleMouseEnter}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			initial={{ }}
			style={{ borderRadius: 40 }}
		>
			<motion.div layout initial={{ width: 0, opacity: 0 }} style={{ whiteSpace: "nowrap" }} ref={content}>
				<span className="px-4">Vérifier ce site</span>
			</motion.div>
			<motion.div className="flex justify-center items-center text-base-100 bg-primary rounded-full" style={{ height: 40 }} initial={{ width: "auto" }} ref={blue}>
				<motion.div className="px-4" ref={icon}>
					Vérifier ce site
				</motion.div>
			</motion.div>
		</motion.div>
	);

}
