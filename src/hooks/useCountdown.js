import { useEffect, useState } from "react";

const useCountdown = (startSeconds = 0) => {
	const [secondsLeft, setSecondsLeft] = useState(startSeconds);

	useEffect(() => {
		if (secondsLeft <= 0) {
			return undefined;
		}

		const intervalId = window.setInterval(() => {
			setSecondsLeft((currentSeconds) =>
				currentSeconds <= 1 ? 0 : currentSeconds - 1,
			);
		}, 1000);

		return () => window.clearInterval(intervalId);
	}, [secondsLeft]);

	return {
		secondsLeft,
		isComplete: secondsLeft === 0,
		setSecondsLeft,
	};
};

export default useCountdown;
