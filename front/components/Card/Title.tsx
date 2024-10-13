import { useState, useEffect, useRef } from "react"
import { useAnimate, motion } from "framer-motion"

export default function (props) {

	const [localState, setLocalState] = useState(props.state);
	const [textRef, textAnimate] = useAnimate();

	const enterAnim = async () => {
		await textAnimate(textRef.current, {
			opacity: 1,
			y: 0,
			filter: "blur(0px)"
		}, {
			duration: 0.4,
			ease: [0.65, 0, 0.35, 1]
		})
	}

	const leaveAnim = async () => {
		await textAnimate(textRef.current, {
			opacity: 0,
			y: -10,
			filter: "blur(5px)"
		}, {
			duration: 0.4,
			ease: [0.65, 0, 0.35, 1],
			delay: 0
		})
		await textAnimate(textRef.current, {
			opacity: 0,
			y: 10,
			filter: "blur(5px)"
		}, {
			duration: 0
		})
	}

	const changeLocalState = async (state) => {
		await leaveAnim();
		setLocalState(state);
	}

	useEffect(() => {
		changeLocalState(props.state);
	}, [props.state]);

	useEffect(() => {
		enterAnim();
	}, [localState]);

	const Content = () => {
		switch (localState) {
			case 0:
				return <span>Analyser ce site</span>
			case 1:
				return (
					<>
						<span className="loading loading-spinner loading-xs text-base-100"></span>
						<span>Analyse en cours</span>
					</>
				)
			case 2:
				return (
					<>
						<i className="fa-regular fa-circle-check"></i>
						<span>Entreprise trouvée</span>
					</>
				)
			case 3:
				return (
					<>
						<i className="fa-regular fa-circle-question"></i>
						<span>Aucun résultat</span>
					</>
				)
			case 4:
				return (
					<>
						<i className="fa-regular fa-circle-xmark"></i>
						<span>Erreur technique</span>
					</>
				)
		}
	}

	return (
		<motion.div className="flex items-center gap-x-2" ref={textRef}>
			<Content/>
		</motion.div>
	);

}
