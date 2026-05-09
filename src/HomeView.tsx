import { Suspense, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { PresentationControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from 'three';
import { Model as PutmcTrap } from "./Putmc";
import confetti from "canvas-confetti"; // Type definition handled in src/declarations.d.ts
import type { CommentData } from "./types";
import { renderStars, staggerContainer, cardVariants } from "./utils";

interface HomeViewProps {
  appReady: boolean;
  comments: CommentData[];
  isLoading: boolean;
  modelScale: number;
  newComment: string;
  setNewComment: (v: string) => void;
  newUsername: string;
  setNewUsername: (v: string) => void;
  newRating: number;
  setNewRating: (v: number) => void;
  isSubmitting: boolean;
  handleCommentSubmit: () => void;
  setShowCommentsPage: (v: boolean) => void;
}

// Add your image paths to the 'src' property to display them in the gallery.
// To add more pictures, simply add more objects to this array.
const GALLERY_IMAGES = [
  { id: 1, src: "https://scontent.fceb6-3.fna.fbcdn.net/v/t1.15752-9/676729858_1592447908525513_5072957238340613150_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeH3B9b5X8NwEJLjrZjZzyYGwaqiBMS8-THBqqIExLz5MYMuOHBCrwwL9cP242B8gbRgwkPv78rDTXCXC4ATC1Sf&_nc_ohc=XKf8ocXtOIAQ7kNvwGlTp9c&_nc_oc=AdoZuZy5OrrhdTwQwX2rz_aak_VFkdnTnH7Hx6MgroCFBUu9W8lmeQ8nhiEaHOyqjx4&_nc_zt=23&_nc_ht=scontent.fceb6-3.fna&_nc_ss=7b2a8&oh=03_Q7cD5QGSNgjNDnrD0QFzXTkbJEzfI7c9OL7JhXArrBrTiX7vXA&oe=6A26B0D9", text: "Overall Trap Exterior" },
  { id: 2, src: "https://scontent.fceb6-3.fna.fbcdn.net/v/t1.15752-9/675230716_953597554148896_2529030922401418518_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeGe4L7FcUxFbt9yO_6bFYMZ5IR7ZL_v8zPkhHtkv-_zM2Amt21cUJ9IZ0r7_75Ub8aZy7Q9Ocg2ZuqS124EWxM1&_nc_ohc=ZxTm5DdD4TAQ7kNvwGkJaH5&_nc_oc=Adr_cFhL3kW_LdA8-kZY61vfFB8S_Lu2-6XOJE1onUKxAOsO_E00LqUo2L7RNKDV9DI&_nc_zt=23&_nc_ht=scontent.fceb6-3.fna&_nc_ss=7b2a8&oh=03_Q7cD5QG3f4rKg3wNCeQ9Tp84Z9S7mV6iNtNs8EZTRyrV86U9lA&oe=6A26B3D0", text: "Solar Panel Integration (Placeholder)" },
  { id: 3, src: "https://scontent.fceb6-3.fna.fbcdn.net/v/t1.15752-9/673958615_2396848890778660_3799350715482108645_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeHsURR7LtgyUvo1UATHpTTKFFjY2tJDs94UWNja0kOz3jfPio5elUcQWlPAojayznSX-P8nRTVpdZZze-asDIIG&_nc_ohc=0Axv9Foxb8kQ7kNvwGbkSiX&_nc_oc=AdqpAXPTZPIu8vnzF3SbaoagevJGrG5YmwXmKYL1RFPX26SqdqGmJr0Vvulgdm6Z2I8&_nc_zt=23&_nc_ht=scontent.fceb6-3.fna&_nc_ss=7b2a8&oh=03_Q7cD5QHNi5bR-bVnZ6H99PTodnviVbklgNXTlIXHMrhsX22jeg&oe=6A269C1B", text: "UV LED Module (Placeholder)" },
  { id: 4, src: "https://scontent.fceb6-2.fna.fbcdn.net/v/t1.15752-9/681522021_1518616973322852_9171842112414353355_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeElYc33sSv-SOiAAncIS3hrOWZV4O1ruX45ZlXg7Wu5fkIF9P4WEaj81bQcJjp4kIj0gNHyXzUAhgOgj1GkeHeW&_nc_ohc=5RqAyGEE7NAQ7kNvwHQ_A0D&_nc_oc=Adr-yjcaEdVZHIyZMwyyVbCiKmb_tXDMWmt2UPbm_ndcHIdJXOOJyLyiuRLhIzWy5Vk&_nc_zt=23&_nc_ht=scontent.fceb6-2.fna&_nc_ss=7b2a8&oh=03_Q7cD5QEOuIhYjHb4BvKdmrLteHa4PL6j5CXSCXdgsHjLpFkRGw&oe=6A26ACA9", text: "Vortex Fan Mechanism (Placeholder)" },
  { id: 5, src: "https://scontent.fceb6-2.fna.fbcdn.net/v/t1.15752-9/679626527_841656938974498_7312436348683683728_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeH1OvVSbIv1Z7pXJpz3TixH6G5-j3dzGirobn6Pd3MaKnkS9H8mNtOBu4wwMMWU3WB99NKUaUpv0dxZRkvy8wk8&_nc_ohc=sQmtmF7ecpAQ7kNvwF8DDeK&_nc_oc=AdrBpJgNvKIIHZnGu_mRQbBmoxPji_YQQiD8fyfcaTUJvSfx4gU5EThZ-EIVjtv8fT0&_nc_zt=23&_nc_ht=scontent.fceb6-2.fna&_nc_ss=7b2a8&oh=03_Q7cD5QHR9PvTjm0CAknFd8EoQDeR4gIdMxf7nVbI5Cw96umnyg&oe=6A2691E3", text: "Water Catch Basin (Placeholder)" },
  { id: 6, src: "https://scontent.fceb2-1.fna.fbcdn.net/v/t1.15752-9/673948689_942719138545445_6901088932599115843_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeHkm6RD8bkHRI_Xl2JSbUUtOkp0tqeZz3g6SnS2p5nPeA2_TGnxqbZSIRRU5Sxvt2Ou_YQ7lzkJG1UmbnHN-ioq&_nc_ohc=K6nH9HjXVoIQ7kNvwFhxOmn&_nc_oc=AdowZY6_i08gh7YuFvdg8FZfIu_7LsgsNlNBztNtaD6WpMVPL7t-UOLGYjeS6yKJAkc&_nc_zt=23&_nc_ht=scontent.fceb2-1.fna&_nc_ss=7b2a8&oh=03_Q7cD5QGOAwGMlZgUz-3HoZ19PbDilFohoGKhJu3N5SZUll0-ZA&oe=6A269452", text: "Night Time Field Operation (Placeholder)" },
  { id: 7, src: "https://scontent.fceb6-2.fna.fbcdn.net/v/t1.15752-9/677751551_982608567627864_211395568921380563_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFq6cn183Y9JNHKyWCuizZJ3ZoCUgbLJq3dmgJSBssmrWHtPU6dCsS8uDoVL1Z5l21r94lMlc8-DBlecnpEff2f&_nc_ohc=X3Y1vZYMGSwQ7kNvwFl52QP&_nc_oc=Adogsg9QCRdpnS2Y_1CLxZmBdFqQa97jwZ5lez1ZoV91yYqG9x0ObDv2t2HbrqarGqI&_nc_zt=23&_nc_ht=scontent.fceb6-2.fna&_nc_ss=7b2a8&oh=03_Q7cD5QH6sVTGBT4X6_v5m06UhnQ35eYUurZRFp0ttS5LTRB_zQ&oe=6A26A277", text: "Internal Wiring & Components (Placeholder)" },
  { id: 8, src: "https://scontent.fmnl8-3.fna.fbcdn.net/v/t1.15752-9/675307953_949344807734943_635871340404278541_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFKnD-VOF5769KgcZkWlmDQ5z3KOdoiXS7nPco52iJdLjpdNZMfz0wfKx3OVJsXvAfqI6Ht3iNkyWI8T0FmdvA8&_nc_ohc=IqKGMqYAwQ8Q7kNvwG7VXMh&_nc_oc=AdrpihV1--Jmey9BVt_53hJhot26xEqNbpEVONvzDc8l9ndV6-crec1nQ9b04uxEKsY&_nc_zt=23&_nc_ht=scontent.fmnl8-3.fna&_nc_ss=7b2a8&oh=03_Q7cD5QGuKpQEYyaUi-lMkP1ylcCMi1Fl47e8j2kDI1MMX38u5w&oe=6A26BA0E", text: "Dual-Input Charging Ports (Placeholder)" },
];

const TEAM_MEMBERS = [
  { id: 1, name: "Jose Marie L. Bacalso", phone: "09462382092", email: "bacalsojose821@gmail.com", image: "/josebacalso.png", duration: 3, rotateHover: 10, easterEggImage: "https://scontent.fceb2-2.fna.fbcdn.net/v/t1.15752-9/476404315_1780485009352406_5829210035226652940_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFq-of6Lhb2rUBo9VjROg-L2mXBZMz4bWXaZcFkzPhtZXmlz3IDZH6QsuSk_E2bRpOvrbbT6Eo1LTrHJnUrslx8&_nc_ohc=ZIhmi6Vw84QQ7kNvwH1z3HC&_nc_oc=AdpAwrI32m-GrHMj1GPWpit4IOe33qI4HSVzMEZQs8etJxAoHnrlhdqtfEfXonKSzaY&_nc_zt=23&_nc_ht=scontent.fceb2-2.fna&_nc_ss=7b2a8&oh=03_Q7cD5QEnZlTAa6Sy6bwQQLKYlpsKG-LmadCtzyoF0gncJYaj3w&oe=6A26BF62" },
  { id: 2, name: "Trese Ray Bustamante", phone: "09455835666", email: "treseraybb@gmail.com", image: "/tresebustamante.png", duration: 3.2, rotateHover: -10, easterEggImage: "https://scontent.fceb6-1.fna.fbcdn.net/v/t1.15752-9/490986359_557613567366426_1663639614608701863_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFLmmEbW-ioaBCVL73ze3dEtLN3e3Udyce0s3d7dR3Jx_TcS-S_KY-y9YXRdz1X0VOWZ7VvY3C9Q7IjqrIpLhhD&_nc_ohc=3Tu66IMNkUEQ7kNvwGJH_K0&_nc_oc=AdoRlvYHGFREqPnTwpvLd5-tjG7gaM42mFmMt7nv6s3dUSwU-j_wVcpm1mSSaoEthVA&_nc_zt=23&_nc_ht=scontent.fceb6-1.fna&_nc_ss=7b2a8&oh=03_Q7cD5QFVW-9PLisOypzWbMZv5OSlSoNLAyKs4s9AW6hZljKlKA&oe=6A269C6E" },
  { id: 3, name: "Faith Andrea Egas", phone: "09537799212", email: "faithandreaegas24@gmail.com", image: "/faithegas.png", duration: 2.8, rotateHover: 10, easterEggImage: "https://scontent.fceb6-4.fna.fbcdn.net/v/t1.15752-9/482604286_1621538362574375_146737800062633652_n.jpg?stp=dst-jpg_s2048x2048_tt6&_nc_cat=111&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeF2lt-g8jJimWydCplVwoHYL5hkzM0O77UvmGTMzQ7vtd5pf573Qoywj5UaECFxgYC_Ng9xEgKbh9H0WgzmSebd&_nc_ohc=QaAtK4BNUJYQ7kNvwEPp2w9&_nc_oc=Adq5Mz_qrC7Lz2oagp0hswmY1dN7CKsw4XiN9PosIJJpRfaqO9gDKdwbZVxbfDuDZ-Q&_nc_zt=23&_nc_ht=scontent.fceb6-4.fna&_nc_ss=7b2a8&oh=03_Q7cD5QEqwDTzIQR0QcPInwgyD8Ut3zQcaCmcnTc_L00iS9bM7w&oe=6A26B73B" },
  { id: 4, name: "Marx Carl Hife", phone: "09478543822", email: "marxcarla5@gmail.com", image: "/marxhife.png", duration: 3.5, rotateHover: -10, easterEggImage: "https://scontent.fceb6-4.fna.fbcdn.net/v/t1.15752-9/483463155_640323372259445_5744549702206559449_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFR3G3cLu83BflWvcrklBWjHdWRCvry3jcd1ZEK-vLeN353ZY-qH44mTqFeZs9jL9AcfF9j41yVA1uuaOSCkIqb&_nc_ohc=M6pMtx_QWeYQ7kNvwF_kNmn&_nc_oc=AdoLQxHW184y781q9rjDnZjQAU9t7d6yjwebrMZbR0dV27QfD3WcXjdeYtJzKttQ9uw&_nc_zt=23&_nc_ht=scontent.fceb6-4.fna&_nc_ss=7b2a8&oh=03_Q7cD5QEo4xrUsSzdAPIHB8AxszuuPuLNazJNEW5WpY-JNCAKjg&oe=6A26CD9B" },
  { id: 5, name: "Dave Lawas", phone: "09702231654", email: "dave.lawas1234@gmail.com", image: "/davelawas.png", duration: 3.1, rotateHover: 10, easterEggImage: "https://scontent.fceb2-1.fna.fbcdn.net/v/t1.15752-9/482972590_911743170890485_7232128868691866006_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeGkXnskzkxbzOJYtiuCis-8uqYEHvuBjoS6pgQe-4GOhDRkmu_nLAHStXWKIV-GYIw2XpciI44JLX84Okz4-CZr&_nc_ohc=SFGPmRi-gdYQ7kNvwE_oW6v&_nc_oc=AdpxKMbzmx6OF3_zx_2FWpncUiulII6DDJ-K0IosaIxxAyU2gS0Bo9T1VvmuuOphx5c&_nc_zt=23&_nc_ht=scontent.fceb2-1.fna&_nc_ss=7b2a8&oh=03_Q7cD5QESLvpfiS_takkKRvHsdbyazZ3mCCFa_Fimg-dz6zTZ4g&oe=6A26B945" },
  { id: 6, name: "Jhon Hervy Yu", phone: "09924744150", email: "yujhervy@gmail.com", image: "/hervyyu.png", duration: 3.1, rotateHover: 10, easterEggImage: "https://scontent.fceb6-4.fna.fbcdn.net/v/t1.15752-9/598508903_735615699569719_3795906362493047287_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeEnCKkaR9_ZtpbTqZqQa3z6TiJfo6Z_MUROIl-jpn8xRIAwC02BMfFcaWgPmuAH0ldpFIrvGwaGsI4ZTeJLlF7h&_nc_ohc=QBBonSp-eiAQ7kNvwEniOGZ&_nc_oc=AdpS-y9TJ8VDfYpdhXCOhSzqzVxPiBotTbFgd_guTYpK9wwkQ1ufBN0kXKt7kifE66w&_nc_zt=23&_nc_ht=scontent.fceb6-4.fna&_nc_ss=7b2a8&oh=03_Q7cD5QHK5SWNJN26AKpIzrq_Q6Sl-NudAAzon_df2XaCa2Sulg&oe=6A26AF22" }
];

const AMBIENT_MOSQUITOES = [
  { id: 1, duration: 5, x: [-150, 0, 150, 50, -150], y: [-200, -250, -150, -100, -200], rotate: [0, 20, -20, 10, 0], scale: 0.8 },
  { id: 2, duration: 7, x: [100, 200, 50, -100, 100], y: [-100, -150, -250, -200, -100], rotate: [-10, 10, 30, -10, -10], scale: 1.1 },
  { id: 3, duration: 6, x: [-50, -200, -100, 100, -50], y: [-250, -150, -50, -100, -250], rotate: [20, -10, -30, 20, 20], scale: 0.9 },
  { id: 4, duration: 8, x: [150, 50, -150, -50, 150], y: [-150, -50, -100, -250, -150], rotate: [-20, -40, 10, 30, -20], scale: 0.7 },
  { id: 5, duration: 4.5, x: [0, -100, 100, 200, 0], y: [-50, -200, -250, -150, -50], rotate: [10, 30, -10, -20, 10], scale: 1 },
];

const DEFENSE_IMAGES = [
  { id: 1, src: "https://scontent.fceb6-4.fna.fbcdn.net/v/t1.15752-9/671683672_4374456702832217_2459160986591133303_n.jpg?stp=dst-jpg_s2048x2048_tt6&_nc_cat=105&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeF5kBPLOdw6ZI-DS2LrSi5-H8yM-8Z2zHQfzIz7xnbMdGZPtz0mvwj5uN4eeqZfbY3oRnd2DF3EWVxiptNhH8wZ&_nc_ohc=2_2I7wW3rPAQ7kNvwGWAvml&_nc_oc=AdpLFRoj3rmy1dgroK8DEUk19pmDUjWUOH8SGmdFvdYPJLSp-RrDHxLtVxY-HN8_6zY&_nc_zt=23&_nc_ht=scontent.fceb6-4.fna&_nc_ss=7b2a8&oh=03_Q7cD5QGl8SCpHxC0IgvMd6Qf9MQ6bXl9ohXw982MFkK7R-X0hg&oe=6A269540", text: "Research Defense 1 (Placeholder)" },
  { id: 2, src: "https://scontent.fceb6-3.fna.fbcdn.net/v/t1.15752-9/676904284_650690554806460_8000844617681128085_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFdBquVsK05QDJi5FA4di2BupFPJ18iNe26kU8nXyI17TmIX9GqFVK4HRlRxDSCYhuxUu67XEKJFgONNmYVoN2s&_nc_ohc=ntrqHkMGtrAQ7kNvwEsEjCr&_nc_oc=AdoBEGbtafjqwnhPiGPj2_5u1czqw4DpftOE_RsdPeJCfk3JMcNj1YwTTYvaGS94FgA&_nc_zt=23&_nc_ht=scontent.fceb6-3.fna&_nc_ss=7b2a8&oh=03_Q7cD5QGr-2qpzac_CpwpGzV-DGogqER-9cl631488XCUhVHPnA&oe=6A269F6C", text: "Research Defense 2 (Placeholder)" },
  { id: 3, src: "https://scontent.fceb6-3.fna.fbcdn.net/v/t1.15752-9/675309043_1395720029251056_2200151291031451186_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFYpQysiEVEvBzC2VqzVngSu0NIG6bkvMu7Q0gbpuS8y20x4KnbJ0CFDgoIXQtiphyA7t47Ec7gfrTEb_tlEBRx&_nc_ohc=a7HLvBlR3AMQ7kNvwE1MkXE&_nc_oc=Adqs1Vks814Nr3GQlc705L89ftlTd43-n0xgrqRFnOzzrtSNEC7eYwGdd8h1VDimZ2U&_nc_zt=23&_nc_ht=scontent.fceb6-3.fna&_nc_ss=7b2a8&oh=03_Q7cD5QF7frSnrXWq91O0bOPQTKdS-On-rJG5iZUWemnrnlKy3w&oe=6A26A941", text: "Research Defense 3 (Placeholder)" },
  { id: 4, src: "https://scontent.fceb6-4.fna.fbcdn.net/v/t1.15752-9/670886612_2373923733112662_2123811619914734_n.jpg?stp=dst-jpg_s2048x2048_tt6&_nc_cat=105&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFjt1EltV7gZLmNn28nGSeL885wv5XKeFfzznC_lcp4V1WqfA0z9l8WlU9tU4A3qxgDvbf8Thanj87mGOGlUiLj&_nc_ohc=FlSdiQbqNBwQ7kNvwG9rMyy&_nc_oc=AdpyDuDn8mPVMfH1AS0ZMHQanotAN3Gmms4l22Xj5VkMsQyIm6aIU7pDL_ZzNgi_bms&_nc_zt=23&_nc_ht=scontent.fceb6-4.fna&_nc_ss=7b2a8&oh=03_Q7cD5QF1sed6MbH_xPdrMFi-5JV91SaoG1ccQlWuAU-RjCikpw&oe=6A26BE10", text: "Research Defense 4 (Placeholder)" }
];

function TeamCard({ member }: { member: typeof TEAM_MEMBERS[0] }) {
  const [clicks, setClicks] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isFlipped = clicks >= 3;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAnimating) return; // Prevent click spam while the card is flipping

    if (isFlipped) {
      setClicks(0); // Instantly resets to the original state on the 4th click
    } else {
      const newClicks = clicks + 1;
      setClicks(newClicks);
      
      // Trigger confetti exactly when the card flips
      if (newClicks === 3) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600); // Lock clicks during the 0.6s flip animation

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { x, y },
          colors: ['#c45e3e', '#7f54f8', '#ffffff', '#e18355'], // Brand colors
          zIndex: 99999
        });
      }
    }
  };

  return (
    <motion.div 
      className="team-card glass-panel" 
      variants={cardVariants} 
      whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
      onClick={handleClick}
      style={{ padding: 0, perspective: 1000, cursor: "pointer", userSelect: "none", WebkitUserSelect: "none", touchAction: "manipulation" }}
    >
      <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={isFlipped ? { duration: 0.6, type: "spring", bounce: 0.4 } : { duration: 0 }} style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d" }}>
        {/* Front of the Card */}
        <div style={{ padding: "3rem 2rem", backfaceVisibility: "hidden" }}>
          <motion.div className="team-photo" animate={{ y: [-5, 5, -5], boxShadow: ["0px 0px 10px rgba(196, 94, 62, 0.2)", "0px 10px 25px rgba(196, 94, 62, 0.7)", "0px 0px 10px rgba(196, 94, 62, 0.2)"] }} transition={{ duration: member.duration, repeat: Infinity, ease: "easeInOut" }} whileHover={{ rotate: member.rotateHover, scale: 1.05 }} style={{ backgroundImage: `url('${member.image}')`, backgroundSize: "cover", backgroundPosition: "center" }}></motion.div>
          <h3>{member.name}</h3><p>Phone: {member.phone}</p><p>Email: {member.email}</p>
        </div>

        {/* Back of the Card (Easter Egg) */}
        <div style={{ padding: "1rem", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backfaceVisibility: "hidden", transform: "rotateY(180deg)", display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.3)", borderRadius: "inherit" }}>
          <img src={member.easterEggImage} alt="Easter Egg" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "8px", objectFit: "contain" }} draggable={false} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HomeView({
  appReady, comments, isLoading, modelScale, newComment, setNewComment, newUsername,
  setNewUsername, newRating, setNewRating, isSubmitting, handleCommentSubmit, setShowCommentsPage
}: HomeViewProps) {

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Setup scroll tracking for the animated demo section
  const demoRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: demoRef,
    offset: ["start start", "end end"]
  });
  
  const mosquitoX = useTransform(scrollYProgress, [0, 0.3, 0.6, 0.8], [120, 60, 0, 0]);
  const mosquitoY = useTransform(scrollYProgress, [0, 0.3, 0.6, 0.8], [-200, -80, -60, 120]);
  const mosquitoScale = useTransform(scrollYProgress, [0, 0.6, 0.8], [1.2, 1.2, 0]);
  const mosquitoOpacity = useTransform(scrollYProgress, [0.7, 0.8], [1, 0]);
  const mosquitoRotate = useTransform(scrollYProgress, [0, 0.4, 0.8], [-20, -20, 720]);
  const demoFanSpeed = useTransform(scrollYProgress, [0, 0.5, 0.8], [15, 15, 100]);

  // Ripple effects that start just as the mosquito enters the water (around 0.78)
  const rippleScale1 = useTransform(scrollYProgress, [0.78, 0.85], [0.5, 2.5]);
  const rippleOpacity1 = useTransform(scrollYProgress, [0.78, 0.8, 0.85], [0, 1, 0]);
  const rippleScale2 = useTransform(scrollYProgress, [0.79, 0.88], [0.5, 3.5]);
  const rippleOpacity2 = useTransform(scrollYProgress, [0.79, 0.82, 0.88], [0, 0.6, 0]);

  // Ambient mosquitoes fly away and fade out when scrolling begins
  const ambientScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.5]);
  const ambientOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedImage]);

  useEffect(() => {
    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll(".reveal-on-scroll");
      elements.forEach((el) => observer.observe(el));
    }, 500);

    return () => { clearTimeout(timeoutId); observer.disconnect(); };
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section id="home" className="hero-section">
        <motion.div className="hero-content" initial={{ opacity: 0, x: -40 }} animate={appReady ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}>
          <h1>PORTABLE UV MOSQUITO<br /><span>Solar Trap</span></h1>
          <p>The next generation of sustainable, industrial-grade mosquito control powered by centralized solar intelligence and UV technology.</p>
        </motion.div>
        <motion.div className="hero-canvas-container" initial={{ opacity: 0, scale: 0.85 }} animate={appReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }} transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}>
          <Canvas 
            dpr={[1, 1.5]}
            camera={{ position: [-3, 5, 9], fov: 45 }}
            gl={{ powerPreference: "high-performance", alpha: true, antialias: false, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
            onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
          >
            <fog attach="fog" args={['#100f13', 8, 16]} />
            <ambientLight intensity={0.5} color="#5d3eaf" /> 
            <directionalLight position={[10, 10, 5]} intensity={2} color="#ffd5c0" />
            <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#7f54f8" />
            <PresentationControls global rotation={[0, -Math.PI / 4, 0]} polar={[-0.2, 0.2]} azimuth={[-Math.PI / 2, Math.PI / 2]}>
              <Suspense fallback={<Html center><div style={{ color: "var(--color-orange)", fontFamily: "League Gothic", fontSize: "2rem", letterSpacing: "2px" }}>LOADING ASSETS...</div></Html>}>
                <PutmcTrap scale={10 * modelScale} position={[0, -1.5, 0]} />
              </Suspense>
            </PresentationControls>
            <EffectComposer disableNormalPass multisampling={0}><Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={2} mipmapBlur={false} /></EffectComposer>
          </Canvas>
        </motion.div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about">
        <h2 className="section-title reveal-on-scroll">About The Project</h2>
        <motion.p className="about-intro" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ visible: { transition: { staggerChildren: 0.02 } }, hidden: {} }}>
          {"The Portable UV Trap for Mosquito Control (PUTMC) is a sustainable, chemical-free solution for vector management. By combining solar energy with UV attractants, we offer communities a safer way to combat mosquito-borne diseases.".split(" ").map((word, index) => (
            <motion.span key={index} variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }} style={{ display: "inline-block", marginRight: "0.25em" }}>
              {word}
            </motion.span>
          ))}
        </motion.p>
        <div className="about-grid glass-panel reveal-on-scroll">
          <div><h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "1.5rem" }}>🌱</span> Purpose & Origin</h3><p>Designed for off-grid and industrial use, PUTMC harnesses solar power to deliver efficient, emission-free mosquito control without relying on traditional power grids.</p></div>
          <div><h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "1.5rem" }}>⚙️</span> Mechanism & Performance</h3><p>A Vivid Purple UV LED array attracts mosquitoes, while a powerful 12V DC fan captures them. Built-in Schottky diodes ensure safe and efficient battery charging.</p></div>
          <div><h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "1.5rem" }}>🔋</span> Power Autonomy</h3><p>Powered by an integrated solar panel for daily use, with a seamless USB-C fast-charging fallback to ensure uninterrupted operation during overcast weather.</p></div>
          <div><h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "1.5rem" }}>🌍</span> Environmental Impact</h3><p>A zero-residue alternative to chemical fogs. Its targeted UV wavelength and quiet operation minimize disruption to local ecosystems and beneficial insects.</p></div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features">
        <h2 className="section-title reveal-on-scroll">Product Features</h2>
        <motion.div className="features-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}>
          <motion.div className="feature-card-wrapper" variants={cardVariants} whileHover="hover" style={{ position: "relative", zIndex: 1 }}>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.1, x: 0, y: 0, rotate: -90 },
                visible: { opacity: 0, scale: 0.1, x: 0, y: 0, rotate: -90, transition: { duration: 0.2, ease: "easeOut" } },
                hover: { opacity: 1, scale: 1.1, x: 50, y: -60, rotate: 15, transition: { type: "spring", stiffness: 350, damping: 12, mass: 1.2 } }
              }}
              style={{ position: "absolute", top: "10%", right: "10%", fontSize: "4.5rem", zIndex: 0, pointerEvents: "none", opacity: 0 }}
            >
              🔌
            </motion.div>
            <div className="feature-card glass-panel" style={{ height: "100%", width: "100%" }}>
              <div className="feature-icon">⚡</div><h3>Dual-Input Charging</h3><p>Seamlessly switch between the primary Solar Panel and an emergency USB-C port to ensure continuous operation.</p>
            </div>
          </motion.div>
          <motion.div className="feature-card-wrapper" variants={cardVariants} whileHover="hover" style={{ position: "relative", zIndex: 1 }}>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.1, x: 0, y: 0, rotate: 180 },
                visible: { opacity: 0, scale: 0.1, x: 0, y: 0, rotate: 180, transition: { duration: 0.2, ease: "easeOut" } },
                hover: { opacity: 1, scale: 1.2, x: -50, y: -60, rotate: -20, transition: { type: "spring", bounce: 0.7, duration: 0.8 } }
              }}
              style={{ position: "absolute", top: "1%", left: "10%", fontSize: "4rem", zIndex: 0, pointerEvents: "none", opacity: 0 }}
            >
              🦟
            </motion.div>
            <div className="feature-card glass-panel" style={{ height: "100%", width: "100%" }}>
              <div className="feature-icon">🔦</div><h3>UV Attractant</h3><p>Emits a specific wavelength of light highly attractive to local mosquito populations, drawing them toward the trap housing.</p>
            </div>
          </motion.div>
          <motion.div className="feature-card-wrapper" variants={cardVariants} whileHover="hover" style={{ position: "relative", zIndex: 1 }}>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.1, x: 0, y: 0, rotate: -180 },
                visible: { opacity: 0, scale: 0.1, x: 0, y: 0, rotate: -180, transition: { duration: 0.2, ease: "easeOut" } },
                hover: { opacity: 1, scale: 1.3, x: 60, y: -70, rotate: 360, transition: { type: "spring", stiffness: 200, damping: 15, mass: 1 } }
              }}
              style={{ position: "absolute", top: "10%", right: "10%", fontSize: "5rem", zIndex: 0, pointerEvents: "none", opacity: 0 }}
            >
              🌪️
            </motion.div>
            <div className="feature-card glass-panel" style={{ height: "100%", width: "100%" }}>
              <div className="feature-icon">🌀</div><h3>Vortex Capture Fan</h3><p>A powerful, energy-efficient 12V DC fan creates a downward vacuum, preventing escape and dehydrating the catch.</p>
            </div>
          </motion.div>
          <motion.div className="feature-card-wrapper" variants={cardVariants} whileHover="hover" style={{ position: "relative", zIndex: 1 }}>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.1, x: 0, y: 0, rotate: -60 },
                visible: { opacity: 0, scale: 0.1, x: 0, y: 0, rotate: -60, transition: { duration: 0.2, ease: "easeOut" } },
                hover: { opacity: 1, scale: 1.2, x: -50, y: -60, rotate: 20, transition: { type: "spring", stiffness: 500, damping: 8, mass: 0.5 } }
              }}
              style={{ position: "absolute", top: "10%", left: "10%", fontSize: "4.5rem", zIndex: 0, pointerEvents: "none", opacity: 0 }}
            >
              🦋
            </motion.div>
            <div className="feature-card glass-panel" style={{ height: "100%", width: "100%" }}>
              <div className="feature-icon">🌿</div><h3>Eco-Friendly Design</h3><p>Provides a sustainable, zero-residue solution that targets mosquitoes without harming beneficial insects or local ecosystems.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3D SCROLL ANIMATION DEMO */}
      <section id="demo" ref={demoRef} style={{ height: "200vh", position: "relative", padding: 0 }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
          
          <div style={{ position: "absolute", top: "120px", textAlign: "center", zIndex: 10, width: "100%", padding: "0 5%" }}>
             <h2 className="section-title" style={{ marginBottom: "1rem" }}>Vortex Capture Action</h2>
             <p style={{ color: "#ccc", fontFamily: "Montserrat", fontSize: "1.1rem" }}>Scroll down to see how mosquitoes are drawn in and captured.</p>
             <p style={{ color: "var(--color-orange)", fontFamily: "Montserrat", fontSize: "0.95rem", maxWidth: "600px", margin: "0.5rem auto 0 auto", fontWeight: 500, lineHeight: 1.5 }}>
               Mechanism: The mosquito is attracted by the UV light and sucked in by the powerful downward vortex fan, leading it directly into the water basin below.
             </p>
          </div>

          {/* 3D Canvas (Front View) */}
          <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 1 }}>
             <Canvas 
               dpr={[1, 1.5]}
               camera={{ position: [0, 1.5, 9], fov: 45 }}
               gl={{ powerPreference: "high-performance", alpha: true, antialias: false, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
             >
                <ambientLight intensity={0.5} color="#5d3eaf" /> 
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffd5c0" />
                <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#7f54f8" />
                <Suspense fallback={null}>
                  <PutmcTrap scale={7.5 * modelScale} position={[0, -2.5, 0]} rotation={[0, 0, 0]} fanSpeed={demoFanSpeed} />
                </Suspense>
                <EffectComposer disableNormalPass multisampling={0}><Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={2} mipmapBlur={false} /></EffectComposer>
             </Canvas>
          </div>

          {/* Animated Water Ripples */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 0, height: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 5 }}>
            <motion.div
              style={{
                position: "absolute",
                y: 120,
                width: "80px",
                height: "25px",
                border: "2px solid var(--color-vivid-purple)",
                borderRadius: "50%",
                scale: rippleScale1,
                opacity: rippleOpacity1,
                pointerEvents: "none"
              }}
            />
            <motion.div
              style={{
                position: "absolute",
                y: 120,
                width: "80px",
                height: "25px",
                border: "2px solid var(--color-orange)",
                borderRadius: "50%",
                scale: rippleScale2,
                opacity: rippleOpacity2,
                pointerEvents: "none"
              }}
            />
          </div>

          {/* Ambient Looping Mosquitoes */}
          <motion.div style={{ position: "absolute", top: "50%", left: "50%", x: "-50%", y: "-50%", width: 0, height: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9, scale: ambientScale, opacity: ambientOpacity, willChange: "transform, opacity" }}>
            {AMBIENT_MOSQUITOES.map((mq) => (
              <motion.div
                key={`ambient-${mq.id}`}
                animate={{
                  x: mq.x,
                  y: mq.y,
                  rotate: mq.rotate,
                }}
                transition={{
                  duration: mq.duration,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: "absolute",
                  fontSize: "3rem",
                  scale: mq.scale,
                  pointerEvents: "none",
                  textShadow: "0 0 8px rgba(255, 255, 255, 0.4)",
                  opacity: 0.8
                }}
              >
                🦟
              </motion.div>
            ))}
          </motion.div>

          {/* Animated Mosquito Emoji */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 0, height: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10 }}>
            <motion.div
              style={{
                 position: "absolute",
                 fontSize: "4.5rem",
                 x: mosquitoX,
                 y: mosquitoY,
                 scale: mosquitoScale,
                 opacity: mosquitoOpacity,
                 rotate: mosquitoRotate,
                 pointerEvents: "none",
                 textShadow: "0 0 10px rgba(255, 255, 255, 0.6)"
              }}
            >
              🦟
            </motion.div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery">
        <h2 className="section-title reveal-on-scroll">Gallery</h2>
        <div className="gallery-grid reveal-on-scroll">
          {GALLERY_IMAGES.map((img) => (
            <div key={img.id} className="gallery-item glass-panel" style={{ overflow: "hidden", padding: img.src && img.src.length > 0 ? 0 : "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
              {Array.isArray(img.src) && img.src.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: img.src.length > 1 ? "repeat(2, 1fr)" : "1fr", gridAutoRows: "1fr", gap: "2px", width: "100%", height: "100%", borderRadius: "inherit", overflow: "hidden", background: "rgba(0,0,0,0.3)" }}>
                  {img.src.map((s, idx) => (
                    <img key={idx} src={s} alt={`${img.text} ${idx + 1}`} onClick={() => setSelectedImage(s)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: "zoom-in" }} />
                  ))}
                </div>
              ) : typeof img.src === "string" && img.src ? (
                <img src={img.src} alt={img.text} onClick={() => setSelectedImage(img.src as string)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "inherit", cursor: "zoom-in" }} />
              ) : (
                <span style={{ textAlign: "center" }}>{img.text}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* TEAM SECTION */}
      <section id="team">
        <h2 className="section-title reveal-on-scroll">Research Team</h2>
        <motion.div className="team-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}>
          {TEAM_MEMBERS.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </motion.div>
        
        <h3 className="section-title reveal-on-scroll" style={{ marginTop: "6rem", fontSize: "2.5rem", marginBottom: "2.5rem" }}>Research Defense</h3>
        <div className="defense-grid reveal-on-scroll">
          {DEFENSE_IMAGES.map((img) => (
            <div key={img.id} className="defense-item glass-panel" style={{ overflow: "hidden", padding: img.src ? 0 : "1.5rem" }}>
              {img.src ? (
                <img src={img.src} alt={img.text} onClick={() => setSelectedImage(img.src)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "inherit", cursor: "zoom-in" }} />
              ) : (
                <span style={{ textAlign: "center" }}>{img.text}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FEEDBACK SECTION */}
      <section id="comments">
        <h2 className="section-title reveal-on-scroll">Feedback & Recommendations</h2>
        <div className="comments-container glass-panel reveal-on-scroll">
          <p style={{ marginBottom: "1rem" }}>Leave your thoughts, deployment observations, or recommendations for future iterations below.</p>
          <input type="text" placeholder="Your Name (optional)" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{ width: "100%", background: "rgba(0, 0, 0, 0.2)", border: "1px solid var(--glass-border)", color: "var(--color-white)", fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem", padding: "1rem", borderRadius: "6px", transition: "border-color 0.3s, box-shadow 0.3s" }} />
          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <span style={{ color: "#d1d1d1", marginRight: "1rem", fontFamily: "Montserrat" }}>Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} onClick={() => setNewRating(star)} style={{ cursor: "pointer", color: star <= newRating ? "#ffd700" : "#555", fontSize: "1.5rem", marginRight: "4px", transition: "color 0.2s" }}>★</span>
            ))}
          </div>
          <textarea rows={5} placeholder="Type your thoughts or recommendations here..." value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={handleCommentSubmit} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>{isSubmitting ? "Submitting..." : "Submit Comment"}</button>
            <button onClick={() => setShowCommentsPage(true)} style={{ background: "transparent", border: "2px solid var(--color-orange)", color: "var(--color-orange)", boxShadow: "none" }}>View All Comments</button>
          </div>

          {isLoading ? (
             <p style={{ textAlign: "center", color: "#ccc", marginTop: "2.5rem" }}>Loading comments...</p>
          ) : comments.length > 0 && (
            <div style={{ marginTop: "2.5rem", textAlign: "left" }}>
              <h3 style={{ color: "var(--color-orange)", marginBottom: "1rem", fontFamily: "League Gothic", fontSize: "1.8rem", letterSpacing: "1px" }}>Recent Comments ({comments.length})</h3>
              {comments.slice(-3).reverse().map((comment) => (
                <div key={comment.id} style={{ background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid var(--glass-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div><strong style={{ color: "var(--color-orange)", fontFamily: "Montserrat" }}>{comment.username}</strong><span style={{ color: "#888", fontSize: "0.85rem", marginLeft: "10px" }}>{comment.timestamp}</span><span style={{ marginLeft: "10px" }}>{renderStars(comment.rating)}</span></div>
                  </div>
                  <p style={{ color: "#d1d1d1" }}>{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.9)", zIndex: 9999999,
              display: "flex", justifyContent: "center", alignItems: "center",
              cursor: "zoom-out", padding: "2rem", backdropFilter: "blur(10px)"
            }}
          >
            <button 
              onClick={() => setSelectedImage(null)} 
              style={{ position: "absolute", top: "20px", right: "30px", background: "transparent", border: "none", color: "white", fontSize: "3rem", cursor: "pointer", zIndex: 10, padding: "10px" }}
            >
              &times;
            </button>
            <motion.img
              src={selectedImage}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", bounce: 0.3 }}
              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", borderRadius: "8px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}