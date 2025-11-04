import { useEffect, useMemo, useRef, useState } from "react";
import "./Gallery.css";
import img01 from "../../assets/img01.jpg";
import img02 from "../../assets/img02.jpg";
import img03 from "../../assets/img03.jpg";
import img04 from "../../assets/img04.jpg";
import img05 from "../../assets/img05.jpg";
import img06 from "../../assets/img06.jpg";
import img07 from "../../assets/img07.jpg";
import img08 from "../../assets/img08.jpg";
import img09 from "../../assets/img09.jpg";
import img10 from "../../assets/img10.jpg";

import img11 from "../../assets/img11.jpg";
import img12 from "../../assets/img12.jpg";
import img13 from "../../assets/img13.jpg";
import img14 from "../../assets/img14.jpg";
import img15 from "../../assets/img15.jpg";
import img16 from "../../assets/img16.jpg";
import img17 from "../../assets/img17.jpg";
import img18 from "../../assets/img18.jpg";
import img19 from "../../assets/img19.jpg";
import img20 from "../../assets/img20.jpg";

import img21 from "../../assets/img21.jpg";
import img22 from "../../assets/img22.jpg";
import img23 from "../../assets/img23.jpg";
import img24 from "../../assets/img24.jpg";
import img25 from "../../assets/img25.jpg";
import img26 from "../../assets/img26.jpg";
import img27 from "../../assets/img27.jpg";
import img28 from "../../assets/img28.jpg";
import img29 from "../../assets/img29.jpg";
import img30 from "../../assets/img30.jpg";

import videoMp4 from "../../assets/video.mp4";

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

type CSSVarStyle = React.CSSProperties & { ["--i"]?: number | string };

// --- Swipeable Overlapping Image Deck (vanilla, no libs) ---

type DeckImage = { src: string; text?: string };

type SwipeDeckProps = {
    images: DeckImage[];
    visible?: number;
    onDepleted?: () => void;
    /** NEW: show this video when all images are swiped out */
    videoSrc?: string;
    /** Optional: start muted (recommended for mobile autoplay) */
    startMuted?: boolean;
};

function SwipeDeck({
    images,
    visible = 3,
    onDepleted,
    videoSrc,
    startMuted = true,
}: SwipeDeckProps) {
    const [idx, setIdx] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(!startMuted);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const slice = useMemo(
        () => images.slice(idx, Math.min(images.length, idx + visible)),
        [idx, images, visible]
    );

    const hasCards = idx < images.length;

    const handleDismissTop = () => {
        const next = idx + 1;
        setIdx(next);
        if (next >= images.length) onDepleted?.();
    };

    const enableSound = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = false;
        videoRef.current.play();
        setSoundEnabled(true);
    };

    return (
        <div className="swipe-deck">
            {hasCards && slice.length > 0 ? (
                <>
                    {/* Back layers */}
                    {slice.slice(1).map((item, i) => {
                        const depth = slice.length - (i + 1);
                        return (
                            <BackLayer
                                key={`back-${idx + i + 1}-${item.src}`}
                                item={item}
                                depth={depth}
                            />
                        );
                    })}

                    {/* Top interactive card */}
                    <TopSwipeCard
                        key={`top-${idx}-${slice[0].src}`}
                        item={slice[0]}
                        onDismiss={handleDismissTop}
                    />
                </>
            ) : (
                <div className="swipe-empty">
                    <p>
                        หมดรูปแล้วน้า ✨ สุดท้ายนี้ไม่รู้ผลลัพธ์ของความสัมพันธ์ ของเราจะออกมาเป็นอย่างไร
                        แต่เค้าขอบคุณเธอมากนะคะกับเรื่องราวที่ผ่านมา และเค้าก็อยากจะมอบเรื่องราวดีๆให้กับเธอเหมือนกันนะคะ
                    </p>

                    {/* Show video when deck is empty */}
                    {videoSrc && (
                        <>
                            <video
                                ref={videoRef}
                                src={videoSrc}
                                autoPlay
                                muted={!soundEnabled}
                                loop
                                playsInline
                                className="ending-video"
                            />
                            {!soundEnabled && (
                                <button className="sound-btn" onClick={enableSound}>
                                    เปิดเสียง 💗
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function BackLayer({ item, depth }: { item: DeckImage; depth: number }) {
    const translateY = 14 * depth;
    const scale = 1 - depth * 0.035;

    return (
        <div
            className="swipe-card swipe-back"
            style={{
                transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
                zIndex: 50 - depth,
            }}
        >
            <img src={item.src} alt="" draggable={false} />
            {item.text && <div className="swipe-caption">{item.text}</div>}
        </div>
    );
}

function TopSwipeCard({
    item,
    onDismiss,
}: {
    item: DeckImage;
    onDismiss: () => void;
}) {
    const [dragX, setDragX] = useState(0);
    const [grabbing, setGrabbing] = useState(false);
    const [dismiss, setDismiss] = useState<null | "left" | "right">(null);
    const startXRef = useRef(0);

    const THRESHOLD = 120;

    const onPointerDown = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setGrabbing(true);
        startXRef.current = e.clientX;
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!grabbing) return;
        setDragX(e.clientX - startXRef.current);
    };

    const onPointerUp = () => {
        if (!grabbing) return;
        setGrabbing(false);

        if (Math.abs(dragX) > THRESHOLD) {
            const dir = dragX > 0 ? "right" : "left";
            setDismiss(dir);
            setTimeout(() => {
                setDismiss(null);
                setDragX(0);
                onDismiss();
            }, 260);
        } else {
            setDragX(0);
        }
    };

    const rotation = dragX / 12;
    const base = `translate(-50%, -50%)`;
    const draggingTransform = `${base} translateX(${dragX}px) rotate(${rotation}deg)`;
    const offscreen =
        dismiss === "right"
            ? `translateX(calc(50vw + 60%)) rotate(18deg)`
            : `translateX(calc(-50vw - 60%)) rotate(-18deg)`;
    const finalTransform = dismiss ? `${base} ${offscreen}` : draggingTransform;

    return (
        <div
            className={`swipe-card ${grabbing ? "grabbing" : ""} ${dismiss ? "dismiss" : ""}`}
            style={{
                transform: finalTransform,
                transition: grabbing
                    ? "none"
                    : "transform 240ms cubic-bezier(.22,.61,.36,1), opacity 240ms",
                opacity: dismiss ? 0 : 1,
                zIndex: 100,
                touchAction: "none",
                cursor: grabbing ? "grabbing" : "grab",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            <img src={item.src} alt="" draggable={false} />
            <div className="swipe-gradient" />
            {item.text && <div className="swipe-caption">{item.text}</div>}
        </div>
    );
}

export default function Gallery() {
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    // UI states
    const [showChoices, setShowChoices] = useState(false);
    const [yesScale, setYesScale] = useState(1);
    const [noScale, setNoScale] = useState(1);
    const [noButtonVisible, setNoButtonVisible] = useState(true);

    // Scroll progress
    const [progress, setProgress] = useState(0);

    // confetti
    const [burst, setBurst] = useState<ConfettiShard[]>([]);
    const confettiCount = 52;

    // Minimal palette with your accent
    const accent = "#c68e87";
    const accentPalette = useMemo(
        () => [
            accent,
            "#d2a49e",
            "#b47970",
            "#a86d64",
            "#8f5850",
            "#ff9bb3",
            "#ffb3c1",
            "#8ab6ff",
            "#9bd0ff",
            "#ffe08a",
            "#c8a2ff",
            "#a8e6cf",
            "#ffd3b6",
            "#ffaaa5",
            "#d8bfd8",
        ],
        []
    );

    const makeBurst = useMemo(
        () => () => {
            const shapes: Array<"rect" | "heart" | "star" | "circle" | "sparkle"> = [
                "rect",
                "heart",
                "star",
                "circle",
                "sparkle",
            ];

            const shards: ConfettiShard[] = Array.from({ length: confettiCount }).map((_, i) => ({
                id: Date.now() + i,
                x: Math.random() * 100,
                y: Math.random() * 10 + 5,
                r: Math.random() * 360,
                s: Math.random() * 0.7 + 0.6,
                d: Math.random() * 1.2 + 1.6,
                dx: (Math.random() - 0.5) * 22,
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                color: accentPalette[Math.floor(Math.random() * accentPalette.length)],
            }));
            return shards;
        },
        [accentPalette]
    );

    // Your letter content → cards
    const notes: string[] = [
        "ก่อนจะถึงเดือนธันวาเค้าอยากจะทำอะไรให้เธอสักอย่างจริงๆ",
        "เค้าตั้งใจอยากจะให้สิ่งนี้เธอมากๆนะคะ ให้ดอกไม้คือเป็นการง้อหรือป่าวน้าา แต่อยากให้เธอนะคะ",
        "จริงๆทางที่ดีคือเราควรต้องคุยต่อหน้ากันมากกว่า แต่เวลาคุยต่อหน้าเธอทีไรเค้าเรียบเรียงคำพูดไม่ค่อยถูก😅",
        "ตอนแรกเค้าว่าจะเขียนการ์ดมาแต่รู้สึกว่ามันอาจจะดูยาวเกินไป",
        "โอเค เค้าอดทนอยู่โดยที่ไม่มีเธอตามที่เธอบอกแล้วนะคือมันยากจริงๆคับ🥲",
        "เค้าใช้เวลาทบทวนตัวเองอยู่หลายวัน",
        "แต่พอนึกย้อนกลับไปแล้วทำให้รู้เลยคับ อย่างที่เธอบอกจริงๆนั่นแหละเธอพยายามมากๆ เธอทำทุกอย่างเท่าที่ทำได้",
        "เธอพยายามรักษาความสัมพันธุ์ของเรามาตลอดอยู่ฝ่ายเดียว",
        "ไม่รู้ว่าจะอธิบายยังไงแต่พอคิดทบทวนแล้ว เมื่อปีแรกๆเค้าไม่ได้รู้สึกรักเธอขนาดนี้ แต่พอเค้าเริ่มรักเธอขึ้นมาจริงๆ เค้ายังรู้จักแต่ความรักเด็กๆไปวันๆ นั่นแหละมันดูไม่โตอย่างที่เธอพูด",
        "ความคิดเขาที่ผ่านมาเค้าแค่รู้สึกเวลาเราคุยกันดีๆ ไม่นอกใจกัน ตอบแชทโทรคุยเป็นประจำหรือแค่มีเธออยู่ข้างๆ ได้ยินเสียงเธอได้เห็นหน้าเธอ เค้าก็มีความสุขแล้ว",
        "แล้วเค้าก็ยังคิดแค่ว่าเค้าไม่ออกไปไหน ไม่ไปเที่ยว ไม่ติดเพื่อน เค้าแค่นั่งทำงานนั่งเรียนไปวันๆแล้วก็รอคุยกับเธอแค่นั้น",
        "แต่มันกลับไม่ใช่เลยมันดันกลายเป็นการไม่ทำอะไรจริงๆคับ แค่รู้สึกว่าให้ข้าวฟ่างมาอยู่ข้างๆตัวเองจนมองข้ามความรู้สึกของเธอไปจริงๆเหมือนเธอยืนพิงท่อนไม้ยังงั้น อารมณ์แบบเหมือนเค้าไม่มีกิ่งก้านอะไรไปบังฝนบังแดดให้เธอเลยรู้แค่ว่าเธออยู่ข้างๆก็พอใจแล้ว",
        "พอเค้าลองคิดแล้วเค้าก็เข้าใจแล้วคับ ทั้งๆที่เค้าอยู่ข้างๆเธอ แต่ว่าเธอบอกเค้าว่าเธอพึ่งอะไรเค้าไม่ได้เลยจนเธอต้องไปพึ่งคนอื่นแทน",
        "จริงๆเค้ารู้สึกเสียใจมากๆเวลาที่เธอเอาเค้าไปเปรียบเทียบกับคนอื่นว่า เค้าไม่เท่าคนนี้เค้าไม่เท่าคนนั้น",
        "คือพอเค้าคิดมาถึงตรงนี้เค้าก็ รู้สึกแย่จริงๆคับ ที่เค้าทำนิสัยเห็นแก่ตัว ที่จะรับจากเธออย่างเดียว🥹",
        "แล้วพอถึงวันที่เค้าต้องเป็นคนที่อยู่ข้างเธอจริงๆ กลับไม่สามารถรับอารมณ์อื่นๆของเธอได้เลย เพราะตัวเองได้รับร้อยยิ้ม เสียงหัวเรอะที่เธอพยายามทำให้เค้ามาตลอด",
        "หลายวันที่ผ่านมานี้ เค้าพยามคิดแล้วก็หาวิธีรักษาความสัมพันธ์ของเราแล้วนะคะ จริงๆเค้าอยากแก้มันมากๆ แต่เค้าจะยอมรับการตัดสินใจของเธอนะ เพราะที่ผ่านมาเค้าแย่จริงๆ ที่เค้าไม่สามารถทำอะไรให้เธอได้เท่าที่เธอต้องการจากเค้า คือตอนนี้เค้าได้แค่จับมือเธอไว้เท่านั้นไม่กล้าที่จะดึงมือเธอมาด้วยซ้ำ",
        "เค้าพยายามจะยอมรับให้ได้เหมือนที่เธอบอกนะคะ แต่ทุกๆวันที่ผ่านมานี้เค้าก็กลัวอยู่ดีที่เธอจะสบัดมือเค้าออกไป แต่เค้ารู้สึกแบบนี้มากๆนะคับตอนนี้คือเค้าไม่อยากเสียเธอไป แต่มันคงยากแล้วใช่ไหมคะ เค้าเข้าใจเธอคับที่เธอจะมีเหตุผลไปจากเค้าจริงๆ",
        "เค้าไม่รู้จะพูดอะไรแล้วเลยแต่เค้าขอบคุณเธอมากๆเลยคับ คือช่วงเวลาหลายปีที่ผ่านมาคับเค้ามีความสุขมากๆ แล้วเค้าก็รักเธอมากขึ้นทุกปี โดยเค้าก็ไม่รู้เหมือนกันว่าทำไมเค้าถึงรักผู้หญิงคนนี้",
        "เค้าได้เรียนรู้จากเธอมาเยอะมากๆ เค้าคอยมองดูเธอตลอดนะคะแต่เค้าดันกลับไม่ทำอะไรเลยจนเธอต้องเรียกร้อง🥹 แต่เค้าก็อยากเอาสิ่งที่เรียนรู้แล้วก็ความผิดพลาดนี้มารักษาความสัมพันธ์ของเราต่อนะคับเค้ารู้ว่ามันเกิดรอยร้าวหรือสำหรับเธออาจจะแตกไปบางส่วนแล้วแต่เค้าก็อยากจะซ่อมมันจริงๆนะ",
        "อาจจะดูเห็นแก่ตัวอีกแล้วแต่เธอไม่ไปได้มั้ย",
        "เรื่องจริงนะคะที่เวลาเค้าเห็นเธอยิ้มเค้ามีความสุขมากๆ แต่ขอโทษจริงๆครับที่เค้าไม่เคยทำให้เธอยิ้มเลย เธอบอกเธอพยายามยิ้มเองแต่เขาก็อยากทำให้เธอยิ้มบ้างอะ",
        "คืนดีกันได้แล้วนะคะ เค้าให้เธอกระทืบเค้าเลยก็ได้ อยากระบายอะไร นัททีจะรับเอง",
        "มีต่อๆนะ",
    ];

    // Intersection Observer: reveal cards
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const cards = Array.from(el.querySelectorAll(".note-card"));
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible"));
            },
            { root: el, threshold: 0.2 }
        );
        cards.forEach((c) => io.observe(c));
        return () => io.disconnect();
    }, []);

    // manual scroll & show choices at bottom
    const handleScroll = () => {
        const el = scrollerRef.current;
        if (!el) return;
        const max = el.scrollHeight - el.clientHeight || 1;
        setProgress(Math.min(1, el.scrollTop / max));
        const atBottom = Math.ceil(el.scrollTop + el.clientHeight + 1) >= el.scrollHeight;
        setShowChoices(atBottom);
    };

    // init progress
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const max = el.scrollHeight - el.clientHeight || 1;
        setProgress(Math.min(1, el.scrollTop / max));
        const atBottom = Math.ceil(el.scrollTop + el.clientHeight + 1) >= el.scrollHeight;
        setShowChoices(atBottom);
    }, []);

    // Buttons
    const onClickNo = () => {
        const newNoScale = Math.max(0.3, noScale * 0.85);
        const newYesScale = Math.min(2.5, yesScale * 1.15);
        setNoScale(newNoScale);
        setYesScale(newYesScale);
        if (newNoScale <= 0.35) {
            setNoButtonVisible(false);
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        } else {
            if (navigator.vibrate) navigator.vibrate(15);
        }
    };

    const onClickYes = () => {
        if (navigator.vibrate) navigator.vibrate([12, 20, 12]);
        setBurst(makeBurst());

        // tiny overlay + auto open dialer (cannot auto-press "Call" due to OS)
        setShowChoices(false);
        document.body.insertAdjacentHTML(
            "beforeend",
            `<div id="love-call" style="
        position:fixed; inset:0; display:flex; justify-content:center; align-items:center;
        background:rgba(0,0,0,.6); color:white; font-size:22px; font-weight:600; z-index:9999;">
        ☎️ กำลังโทรหาเค้าน้า 💗
      </div>`
        );
        setTimeout(() => {
            window.location.href = "tel:0970973258";
        }, 1000);
    };

    return (
        <div className="credits-page" style={{ backgroundColor: "#ddb892" }}>
            {/* Progress */}
            <div className="progress">
                <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
            </div>

            {/* Manual scroll */}
            <div
                ref={scrollerRef}
                className="credits-scroller"
                onScroll={handleScroll}
                role="region"
                aria-label="Love letter cards"
            >
                {/* Stacked cards */}
                <div className="cards">
                    {notes.map((text, idx) => (
                        <article
                            key={idx}
                            className="note-card"
                            style={{ ["--i"]: idx } as CSSVarStyle}
                        >
                            <div className="note-pin" aria-hidden>♥</div>
                            <p className="note-text">{text}</p>
                        </article>
                    ))}
                </div>
            </div>

            {/* Choices */}
            {showChoices && (
                <div className="choices-container">
                    {/* NEW: overlapping swipe deck */}
                    <div className="swipe-wrap">
                        <SwipeDeck
                            images={[
                                { src: img01, text: "เธอยิ้มละน่ารักสุดๆ 😆💗" },
                                { src: img02, text: "เธอดูแลเค้าดีมากๆ 🥺💕" },
                                { src: img03, text: "ตอนนี้เค้ารักเธอจริงๆนะคะ 🎬" },
                                { src: img04, text: "คิดถึงอ้วนมากๆ 🤗🤏" },
                                { src: img05, text: "รูปนี้น่ารัก555 🤗💞" },
                                { src: img06, text: "ไอตัวเล็ก ยิ้มได้ยัง 🌈✨" },
                                { src: img07, text: "หิวอยากกินข้าวด้วยคับ 😳💘" },
                                { src: img08, text: "eatๆๆๆ 🌈🤭💞" },
                                { src: img09, text: "เค้าอยากให้เธอโชคดีบ้างที่มีเค้า 🍀💗" },
                                { src: img10, text: "ตอนนี้เริ่มคถ. หน้าวีนๆของเธอละ 🙆‍♂️💞" },

                                { src: img11, text: "ยิ้มแบบนี้ก็ด้ายยย 🤭🫠❤️" },
                                { src: img12, text: "ทามะจะกัดเค้ามั้ยย 🥹🥹🥹" },
                                { src: img13, text: "คถ.โบ้ด้วย  🙆‍♂️💐💗" },
                                { src: img14, text: "ไออ้วนนนนนนน 🫶" },
                                { src: img15, text: " ❤️💭💘✨" },
                                { src: img16, text: "รักเธอนะคะ… 🥹💕" },
                                { src: img17, text: "ฮิๆๆๆ 🌎🌅🏡💗" },
                                { src: img18, text: "ไปเที่ยวกันอีกนะ 🌙✨" },
                                { src: img19, text: "ทำหน้าดุได้แม่ 🤭💞" },
                                { src: img20, text: "ฮาโหลๆๆ ค้าบบบ 💗" },

                                { src: img21, text: "กิบุฟเฟต์จนหน้าบวม 5555 🤭" },
                                { src: img22, text: "ฮาาโย๋ อยากคุยกับเธอแล้วน้าา🤍" },
                                { src: img23, text: "ยิ้มได้ยัง 😭💗✨" },
                                { src: img24, text: "แบบนี้ 😁😁😁😁😁" },
                                { src: img25, text: "คิดถึงจิงๆน้าาาา 🥺💕" },
                                { src: img26, text: "เขียนไรดีน้าาา 👀🙆‍♂️💞" },
                                { src: img27, text: "แบร่ๆๆๆๆ เจ้าหน้าบึ่งตึง 👀" },
                                { src: img28, text: "เค้าใส่มากี่ภาพนะ อยากใส่สัก 100 ภาพ 🕊️❤️" },
                                { src: img29, text: "คืนดีได้ยังคะเนี่ย แงงงงงงงง 😭😭😭" },
                                { src: img30, text: "สุดท้ายแล้ววน้าาเกี่ยวก้อยคืนดีกันนเถอะ สไลด์รูปสุดท้ายออกด้วยนะคะ✌️✌️✌️" },
                            ]}
                            visible={3}
                            videoSrc={videoMp4}
                            startMuted={true}
                            onDepleted={() => {
                                if (navigator.vibrate) navigator.vibrate([20, 20, 20]);
                            }}
                        />
                    </div>

                    <div className="choices-prompt">คืนดีกันน้าาาาาา 💗</div>
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

            {/* Confetti */}
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
