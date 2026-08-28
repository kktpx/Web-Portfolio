import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const Magnetic = ({ children }) => {
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element || window.matchMedia("(pointer: coarse)").matches) return;

        const xTo = gsap.quickTo(element, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(element, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        const mouseMove = (e) => {
            const { clientX, clientY } = e;
            const { height, width, left, top } = element.getBoundingClientRect();
            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);
            xTo(x * 0.35);
            yTo(y * 0.35);
        };
        const mouseLeave = () => { xTo(0); yTo(0); };

        element.addEventListener("mousemove", mouseMove);
        element.addEventListener("mouseleave", mouseLeave);
        return () => {
            element.removeEventListener("mousemove", mouseMove);
            element.removeEventListener("mouseleave", mouseLeave);
        };
    }, []);

    return React.cloneElement(children, { ref });
};

export default Magnetic;
