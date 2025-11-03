import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Gallery.css";

type ConfettiShard = {
    id: number;
    x: number;
    y: number;
    r: number;
    s: number;
    d: number;
    dx: number;
    shape: "rect" | "heart" | "star" | "circle" | "sparkle";
    color: string;
};

export default function Gallery() {
    const navigate = useNavigate();
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef<number | null>(null);
    const resumeTimerRef = useRef<number | null>(null);

    // controls
    const [running, setRunning] = useState(true);
    const [showChoices, setShowChoices] = useState(false);

    // dynamic button sizes
    const [yesScale, setYesScale] = useState(1);
    const [noScale, setNoScale] = useState(1);
    const [noButtonVisible, setNoButtonVisible] = useState(true);

    // scroll progress
    const [progress, setProgress] = useState(0);

    // romantic elements
    const [hearts] = useState<Array<{ id: number, x: number, y: number }>>([]);
    const [sparkles, setSparkles] = useState<Array<{ id: number, x: number, y: number }>>([]);

    // confetti
    const [burst, setBurst] = useState<ConfettiShard[]>([]);
    const confettiCount = 52;

    const SPEED_PX_PER_SEC = 20;

    // romantic color palette
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const romanticColors = [
        "#ff9bb3", "#ffb3c1", "#8ab6ff", "#9bd0ff", "#ffe08a",
        "#c8a2ff", "#a8e6cf", "#ffd3b6", "#ffaaa5", "#d8bfd8"
    ];

    // generate sparkles
    useEffect(() => {
        const interval = setInterval(() => {
            setSparkles(prev => [...prev, {
                id: Date.now() + Math.random(),
                x: Math.random() * 100,
                y: Math.random() * 100
            }].slice(-20));
        }, 800);

        return () => clearInterval(interval);
    }, []);

    // enhanced confetti burst with more colors and shapes
    const makeBurst = useMemo(
        () => () => {
            const shapes: Array<"rect" | "heart" | "star" | "circle" | "sparkle"> =
                ["rect", "heart", "star", "circle", "sparkle"];

            const shards: ConfettiShard[] = Array.from({ length: confettiCount }).map((_, i) => ({
                id: Date.now() + i,
                x: Math.random() * 100,
                y: Math.random() * 10 + 5,
                r: Math.random() * 360,
                s: Math.random() * 0.7 + 0.6,
                d: Math.random() * 1.2 + 1.6,
                dx: (Math.random() - 0.5) * 22,
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                color: romanticColors[Math.floor(Math.random() * romanticColors.length)]
            }));
            return shards;
        },
        [romanticColors]
    );

    // auto-scroll loop + progress (keep existing logic)
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const step = (ts: number) => {
            if (!running) {
                lastTsRef.current = null;
            } else {
                const last = lastTsRef.current ?? ts;
                const dt = (ts - last) / 1000;
                lastTsRef.current = ts;

                const next = el.scrollTop + SPEED_PX_PER_SEC * dt;
                const max = el.scrollHeight - el.clientHeight;
                el.scrollTop = Math.min(next, max);
            }

            const max = el.scrollHeight - el.clientHeight || 1;
            setProgress(Math.min(1, el.scrollTop / max));

            const atBottom = Math.ceil(el.scrollTop + el.clientHeight + 1) >= el.scrollHeight;
            if (atBottom) {
                setRunning(false);
                setShowChoices(true);
                lastTsRef.current = null;
            } else {
                rafRef.current = requestAnimationFrame(step);
            }
        };

        rafRef.current = requestAnimationFrame(step);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [running]);

    // detect bottom on manual scroll
    const handleScroll = () => {
        const el = scrollerRef.current;
        if (!el) return;

        const atBottom = Math.ceil(el.scrollTop + el.clientHeight + 1) >= el.scrollHeight;
        setShowChoices(atBottom);

        const max = el.scrollHeight - el.clientHeight || 1;
        setProgress(Math.min(1, el.scrollTop / max));
    };

    // pause on user activity
    const pauseAndResumeSoon = () => {
        if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
        setRunning(false);
        resumeTimerRef.current = window.setTimeout(() => setRunning(true), 1500);
    };

    const handlePointerDown = () => {
        setRunning(false);
    };
    const handlePointerUp = () => setRunning(true);

    // cleanup
    useEffect(() => {
        return () => {
            if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // buttons logic
    const onClickNo = () => {
        const newNoScale = Math.max(0.3, noScale * 0.85); // Reduced minimum threshold
        const newYesScale = Math.min(2.5, yesScale * 1.15); // Slightly faster growth

        setNoScale(newNoScale);
        setYesScale(newYesScale);

        // Hide NO button when it becomes too small
        if (newNoScale <= 0.35) {
            setNoButtonVisible(false);
            // Add some celebration when NO disappears
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        } else {
            if (navigator.vibrate) navigator.vibrate(15);
        }
    };

    const onClickYes = () => {
        if (navigator.vibrate) navigator.vibrate([12, 20, 12]);
        setBurst(makeBurst());

        window.setTimeout(() => {
            try {
                navigate("/surprise");
            } catch {
                alert("💛 YES selected!");
            }
        }, 900);
    };

    return (
        <div className="credits-page">
            {/* Enhanced Background layers */}
            <div className="bg-aurora" aria-hidden />
            <div className="bg-stars layer-1" aria-hidden />
            <div className="bg-stars layer-2" aria-hidden />
            <div className="bg-stars layer-3" aria-hidden />

            {/* Floating Hearts */}
            <div className="floating-hearts" aria-hidden>
                {hearts.map(heart => (
                    <div
                        key={heart.id}
                        className="floating-heart"
                        style={{
                            left: `${heart.x}%`,
                            top: `${heart.y}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    >
                        ❤
                    </div>
                ))}
            </div>

            {/* Sparkles */}
            <div className="sparkle-container" aria-hidden>
                {sparkles.map(sparkle => (
                    <div
                        key={sparkle.id}
                        className="sparkle"
                        style={{
                            left: `${sparkle.x}%`,
                            top: `${sparkle.y}%`,
                        }}
                    />
                ))}
            </div>

            {/* Progress bar */}
            <div className="progress">
                <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
            </div>

            <div
                ref={scrollerRef}
                className="credits-scroller"
                onScroll={handleScroll}
                onWheel={pauseAndResumeSoon}
                onTouchMove={pauseAndResumeSoon}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                role="region"
                aria-label="Love credits"
            >
                <div className="credits">
                    <p className="line">ก่อนจะถึงเดือนธันวาเค้าอยากจะทำอะไรให้เธอสักอย่างจริงๆ</p>
                    <p className="line">ไม่รู้ว่ามันจะเป็นสิ่งสุดท้ายหรือเปล่านะคะแต่เค้าตั้งใจอยากจะให้เธอนะคะ</p>
                    <p className="line">จริงๆทางที่ดีคือเราควรต้องคุยต่อหน้ากันมากกว่า แต่เวลาคุยต่อหน้าเธอทีไรเค้าเรียบเรียงคำพูดไม่ค่อยถูก😅</p>
                    <p className="line">ตอนแรกเค้าว่าจะเขียนการ์ดมาแต่รู้สึกว่ามันอาจจะดูยาวเกินไป</p>
                    <p className="line">โอเค เค้าอดทนอยู่โดยที่ไม่มีเธอตามที่เธอบอกแล้วนะคือมันยากจริงๆคับ🥲</p>
                    <p className="line">เค้ายอมรับว่าเค้าเริ่มรักเธอจากศูนย์จริงๆ และเขาไม่รู้ตัวเองด้วยซ้ำว่ารักเธอไปตอนไหน</p>
                    <p className="line">แต่พอนึกย้อนกลับไปแล้วทำให้รู้เลยคับ อย่างที่เธอบอกจริงๆนั่นแหละเธอพยามมากๆ เธอทำทุกอย่างเท่าที่ทำได้ แต่เค้ากลับทำมันพัง</p>
                    <p className="line">ไม่รู้ว่าจะอธิบายยังไงแต่พอคิดทบทวนแล้ว เค้าก็ทำตัวเด็กเด็กจริงๆนั่นแหละมันดูไม่โตเลยจริงๆ</p>
                    <p className="line">ความคิดเขาที่ผ่านมาเค้าแค่รู้สึกเวลาเราคุยกันดีๆ ไม่นอกใจกัน ตอบแชทโทรคุยเป็นประจำหรือแค่มีเธออยู่ข้างๆ ได้ได้ยินเสียงเธอได้เห็นหน้าเธอ เค้าก็มีความสุขแล้ว</p>
                    <p className="line">แล้วเค้าก็ยังคิดแค่ว่าเค้าไม่ออกไปไหน ไม่ไปเที่ยว ไม่ติดเพื่อน เค้าแค่นั่งทำงานนั่งเรียนไปวันๆแล้วก็รอคุยกับเธอแค่นั้น</p>
                    <p className="line">แต่มันกลับไม่ใช่เลยมันดันกลายเป็นการไม่ทำอะไรจริงๆคับ แค่รู้สึกว่าให้ข้าวฟ่างมาอยู่ข้างๆตัวเองจนมองข้ามความรู้สึกของเธอไปจริงๆเหมือนเธอยืนพิงท่อนไม้ยังงั้น อารมณ์แบบเหมือนเค้าไม่มีกิ่งก้านอะไรไปบังฝนบังแดดให้เธอเลยรู้แค่ว่าเธออยู่ข้างๆก็พอใจแล้ว</p>
                    <p className="line">พอเค้าลองคิดแล้วเค้าก็เข้าใจแล้วคับ ทั้งๆที่เค้าอยู่ข้างเธอ แต่ว่าเธอบอกเขาว่าเธอพึ่งอะไรเค้าไม่ได้เลยจนเธอต้องไปพึ่งคนอื่นแทน</p>
                    <p className="line">จริงๆเค้ารู้สึกเสียใจมากๆเวลาที่เธอเอาเค้าไปเปรียบเทียบกับคนอื่นว่า เค้าไม่เท่าคนนี้เค้าไม่เท่าคนนั้น</p>
                    <p className="line">คือพอเค้าคิดมาถึงตรงนี้เค้าก็ รู้สึกแย่จริงๆคับ ที่เค้าทำนิสัยเห็นแก่ตัว ที่จะรับจากเธออย่างเดียว🥹</p>
                    <p className="line">แล้วพอถึงวันที่เค้าต้องเป็นคนที่อยู่ข้างเธอจริงๆ กลับไม่สามารถรับอารมณ์เหมือนของเธอได้เลย</p>
                    <p className="line">หลายวันที่ผ่านมานี้ เค้าพยามคิดแล้วก็หาวิธีรักษาความสัมพันธ์ของเราแล้วนะคะ จริงๆเค้าอยากแก้มันมากๆ แต่เค้าจะยอมรับการตัดสินใจของเธอ เพราะที่ผ่านมาเค้าแย่จริงๆ เค้าได้แค่จับมือเธอไว้เท่านั้นไม่กล้าที่จะดึงมือเธอมาด้วยซ้ำ</p>
                    <p className="line">แต่เค้ารู้สึกแบบนี้มากๆนะคับตอนนี้คือเค้าไม่อยากเสียเธอไป แต่มันคงยากแล้วใช่ไหมคะ เค้าเข้าใจเธอคับที่จะมีเหตุผลไปจากเค้าจริงๆ</p>
                    <p className="line">เค้าไม่รู้จะพูดอะไรแล้วเลยแต่เค้าขอบคุณเธอมากๆเลยคับ คือช่วงเวลาหลายปีที่ผ่านมาคับเค้ามีความสุขมากๆ แล้วเค้าก็รักเธอมากขึ้นทุกปี โดยเค้าก็ไม่รู้เหมือนกันว่าทำไมเค้าถึงรักผู้หญิงคนนี้</p>
                    <p className="line">เค้าได้เรียนรู้จากเธอมาเยอะมากๆแต่เค้า ก็อยากเอาสิ่งที่เรียนรู้แล้วก็ความผิดพลาดนี้มารักษาความสัมพันธ์ของเราเลยนะครับเค้ารู้ว่ามันเกิดรอยร้าวหรือสำหรับเธออาจจะแตกไปบางส่วนแล้วแต่เค้าก็อยากจะซ่อมมันจริงๆนะ</p>
                    <p className="line">อาจจะดูเห็นแก่ตัวอีกแล้วแต่เธอไม่ไปได้มั้ย</p>
                    <p className="line">เรื่องจริงนะคะที่เวลาเค้าเห็นเธอยิ้มเค้ามีความสุขมากๆ แต่ขอโทษจริงๆครับที่เค้าไม่เคยทำให้เธอยิ้มเลย เธอบอกเธอพยายามยิ้มเองแต่เขาก็อย่ากทำให้เธอยิ้มบ้างอะ</p>
                    <p className="line">คืนดีกันได้แล้วนะคะ เค้าให้เธอกระทืบเค้าเลยก็ได้ อยากระบายอะไร นัททีจะรับเอง</p>
                </div>
            </div>

            {/* Enhanced choices */}
            {showChoices && (
                <div className="choices-container">
                    <div className="choices-prompt">
                        คืนดีกันน้าาาาาาาาาาาาาาาาาาาาาาาาาาาาาาาาา
                    </div>
                    <div className="choices glass" role="group" aria-label="Answer choices">
                        <button
                            className="choice-btn yes"
                            style={{ transform: `scale(${yesScale})` }}
                            onClick={onClickYes}
                        >
                            ได้ 💝
                        </button>
                        {noButtonVisible && (
                            <button
                                className="choice-btn no"
                                style={{ transform: `scale(${noScale})` }}
                                onClick={onClickNo}
                            >
                                ไม่ 😢
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Enhanced Confetti layer */}
            <div className="confetti-layer" aria-hidden>
                {burst.map((b) => (
                    <span
                        key={b.id}
                        className={`confetti ${b.shape}`}
                        style={
                            {
                                "--x": `${b.x}vw`,
                                "--y": `${b.y}vh`,
                                "--r": `${b.r}deg`,
                                "--s": b.s,
                                "--d": `${b.d}s`,
                                "--dx": `${b.dx}px`,
                                "--color": b.color,
                            } as React.CSSProperties
                        }
                    />
                ))}
            </div>
        </div>
    );
}