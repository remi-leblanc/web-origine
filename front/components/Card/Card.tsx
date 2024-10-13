import { useState, useEffect, useRef } from "react"
import { useAnimate, motion, useSpring, useMotionTemplate } from "framer-motion"
import axios from "axios"
import Loading from "./Loading";
import Title from "./Title";
import ResultSuccess from "./ResultSuccess";
import ResultFail from "./ResultFail";
import ResultError from "./ResultError";

export default function () {

	const [state, setState] = useState(0);
	const [data, setData] = useState();

	const [card, cardAnimate] = useAnimate();
	const [light, lightAnimate] = useAnimate();
	const [noise, noiseAnimate] = useAnimate();
	const [divider, dividerAnimate] = useAnimate();
	const [content, contentAnimate] = useAnimate();

	const mouseX = useSpring(50, { stiffness: 600, damping: 100 });
	const mouseY = useSpring(0, { stiffness: 600, damping: 100 });

	const openAnimation = async () => {
		await cardAnimate(card.current, {
			width: "100%",
			height: "300px"
		}, {
			duration: 0.5,
			ease: [.42, .22, .21, 1]
		})

		contentAnimate(content.current, {
			opacity: 1,
		}, {
			duration: 1
		})
		await lightAnimate(light.current, {
			opacity: 1
		}, {
			duration: 1
		})
		dividerAnimate(divider.current, {
			opacity: 1
		}, {
			duration: 2
		})
	}

	const changeContent = async (callback) => {
		await contentAnimate(content.current, {
			opacity: 0
		}, {
			duration: 1
		})
		callback();
		contentAnimate(content.current, {
			opacity: 1
		}, {
			duration: 1
		})
	}

	const handleClick = async () => {
		if (state != 0) {
			return;
		}
		setState(1);
		await openAnimation();

		let queryOptions = { active: true, lastFocusedWindow: true };
		// `tab` will either be a `tabs.Tab` instance or `undefined`.
		let [tab] = await chrome.tabs.query(queryOptions);

		axios.post("http://localhost:3000/api/checkcompany/fr", {
			url: tab.url
		})
			.then(function (response) {
				setTimeout(() => {
					if (response.data.code == 200) {
						changeContent(() => {
							setState(2);
							setData(response.data);
						});
					} else if (response.data.code == 500) {
						changeContent(() => {
							setState(4);
							setData(response.data);
						});
					} else {
						changeContent(() => {
							setState(3);
							setData(response.data);
						});
					}

				}, 1000)
			})
			.catch((e) => {
				console.log(e)
			})
	}

	const Content = () => {
		switch (state) {
			case 0:
				return;
			case 1:
				return <Loading />
			case 2:
				return <ResultSuccess data={data} />
			case 3:
				return <ResultFail data={data} />
			case 4:
				return <ResultError data={data} />
		}
	}

	function handleMouseEnter(event) {
		if (state === 0) {
			lightAnimate(light.current, {
				opacity: 0.5
			})
		}
	}

	function handleMouseMove(event) {
		let { left, top, width, height } = event.currentTarget.getBoundingClientRect();
		mouseX.set((1 - ((event.clientX - left) / width)) * 100);
		mouseY.set((1 - ((event.clientY - top) / height)) * 100);
	}

	function handleMouseLeave(event) {
		let { left, width } = event.currentTarget.getBoundingClientRect();
		if (state === 0) {
			lightAnimate(light.current, {
				opacity: 0
			})
		}
		else {
			mouseX.set(50);
			mouseY.set(100);
		}
	}

	return (
		<motion.div
			layout
			onClick={handleClick}
			whileTap={state != 0 ? {} : { scale: 0.9 }}
			className="relative search-card"
			ref={card}
			data-state={state}
			onMouseEnter={handleMouseEnter}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			initial={{ borderRadius: 40 }}
		>
			<motion.div className="light-effect opacity-0" ref={light} style={{
				backgroundPosition: useMotionTemplate`${mouseX}% ${mouseY}%`
			}} />
			<motion.div className="noise-filter opacity-10" ref={noise} />
			<motion.div layout className="flex flex-col items-center h-full">
				<motion.p className="py-4 px-12 text-sm text-base-100 text-base font-semibold text-center">
					<Title state={state} />
				</motion.p>
				<motion.div className="wo-divider w-1/2" ref={divider} initial={{ opacity: 0 }}></motion.div>
				<motion.div className="w-full flex-1 px-8" ref={content} initial={{ opacity: 0 }}>
					<Content />
				</motion.div>
			</motion.div>
		</motion.div>
	);

}
