document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     INSERT_NAME
     CORE EXPERIENCE ENGINE
     ========================================================= */


  /* =========================================================
     HELPERS
     ========================================================= */

  const clamp = (value, min = 0, max = 1) =>
    Math.min(Math.max(value, min), max);

  /* =========================================================
     DOM
     ========================================================= */

  const hero = document.querySelector(".hero");
  const heroTitle = document.querySelector(".hero-title");
  const heroLines = [...document.querySelectorAll(".hero-line")];

  const about = document.querySelector(".about");
  const aboutInfo = document.querySelector(".about-information");
  const aboutSystem = document.querySelector(".about-system");

  const workGrid = document.querySelector(".work-grid");

  const services = document.querySelector(".services");
  const serviceModules = [
    ...document.querySelectorAll(".service-module")
  ];

  const pricing = document.querySelector(".pricing");
  const priceNotes = [
    ...document.querySelectorAll(".price-note")
  ];

  const contact = document.querySelector(".contact");
  const contactTitle =
    document.querySelector(".contact-title");
  const contactCommand =
    document.querySelector(".contact-command");

  const header = document.querySelector(".header");
  const logo = document.querySelector(".logo");


  /* =========================================================
     REVEAL SYSTEM
     ========================================================= */

  const revealElements =
    document.querySelectorAll(".reveal");

  if (revealElements.length) {

    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");

            observer.unobserve(entry.target);

          });

        },
        {
          threshold: 0.15
        }
      );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

  }


  /* =========================================================
     HEADER
     ========================================================= */

  if (header) {

    let lastScrollY = window.scrollY;

    window.addEventListener(
      "scroll",
      () => {

        const currentScrollY = window.scrollY;

        header.classList.toggle(
          "header-hidden",
          currentScrollY > lastScrollY &&
          currentScrollY > header.offsetHeight
        );

        lastScrollY = currentScrollY;

      },
      {
        passive: true
      }
    );

  }


  /* =========================================================
     LOGO LOCAL GLOW
     ========================================================= */

  if (logo) {

    logo.addEventListener(
      "mouseenter",
      () => {
        logo.classList.add("logo-hover");
      }
    );

    logo.addEventListener(
      "mousemove",
      (event) => {

        const rect =
          logo.getBoundingClientRect();

        const x =
          event.clientX - rect.left;

        const y =
          event.clientY - rect.top;

        logo.style.setProperty(
          "--glow-x",
          `${x}px`
        );

        logo.style.setProperty(
          "--glow-y",
          `${y}px`
        );

      }
    );

    logo.addEventListener(
      "mouseleave",
      () => {
        logo.classList.remove("logo-hover");
      }
    );

  }


  /* =========================================================
     DIGITAL POINTER
     ========================================================= */

  const pointer =
    document.createElement("div");

  pointer.className =
    "pointer-orb";

  document.body.appendChild(pointer);

  /* =========================================
   CURSOR — HIDDEN SIGNAL FIELD
   ========================================= */

const cursorField =
  document.createElement("div");

cursorField.className =
  "cursor-field";

document.body.appendChild(cursorField);


  let mouseX = 0;
  let mouseY = 0;

  let currentX = 0;
  let currentY = 0;


let lastMouseX = 0;
let lastMouseY = 0;

let cursorSpeed = 0;

window.addEventListener(
  "mousemove",
  (event) => {

    const dx =
      event.clientX - lastMouseX;

    const dy =
      event.clientY - lastMouseY;

    cursorSpeed =
      Math.min(
        Math.sqrt(dx * dx + dy * dy),
        80
      );

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    mouseX = event.clientX;
    mouseY = event.clientY;

    pointer.classList.add(
      "is-visible"
    );

    cursorField.classList.add(
      "is-visible"
    );

  }
);


  function animatePointer() {

    currentX +=
      (mouseX - currentX) * 0.18;

    currentY +=
      (mouseY - currentY) * 0.18;

    pointer.style.left =
      `${currentX}px`;

    pointer.style.top =
      `${currentY}px`;
      cursorField.style.left =
  `${currentX}px`;

cursorField.style.top =
  `${currentY}px`;

cursorField.style.setProperty(
  "--field-size",
  `${180 + cursorSpeed * 2.2}px`
);

cursorSpeed *= 0.92;

    requestAnimationFrame(
      animatePointer
    );

  }

  animatePointer();


  /* =========================================================
     POINTER TARGETS
     ========================================================= */

  const pointerTargets =
    document.querySelectorAll(
      ".logo, .nav a, .availability, .service-module, .price-note, .contact-command"
    );


  pointerTargets.forEach((target) => {

    target.addEventListener(
      "mouseenter",
      () => {

        pointer.classList.add(
          "is-hovering"
        );

        target.classList.add(
          "is-active"
        );

      }
    );


    target.addEventListener(
      "mouseleave",
      () => {

        pointer.classList.remove(
          "is-hovering"
        );

        target.classList.remove(
          "is-active"
        );

      }
    );

  });

  /* =========================================
   SECTION STATE ENGINE
   ========================================= */

const stateSections = [
  {
    element: hero,
    state: "hero"
  },
  {
    element: about,
    state: "about"
  },
  {
    element: document.querySelector(".work"),
    state: "work"
  },
  {
    element: services,
    state: "services"
  },
  {
    element: pricing,
    state: "pricing"
  },
  {
    element: contact,
    state: "contact"
  }
].filter(item => item.element);


let currentSectionState = "hero";


function setSectionState(state) {

  if (state === currentSectionState) {
    return;
  }

  currentSectionState = state;

  document.body.dataset.sectionState = state;
}


/* Detect which section owns the viewport */

function updateSectionState() {

  const viewportCenter =
    window.innerHeight * 0.5;

  let closestSection = null;
  let closestDistance = Infinity;

  stateSections.forEach(({ element, state }) => {

    const rect =
      element.getBoundingClientRect();

    const sectionCenter =
      rect.top + rect.height * 0.5;

    const distance =
      Math.abs(
        viewportCenter - sectionCenter
      );

    if (distance < closestDistance) {

      closestDistance = distance;
      closestSection = state;

    }

  });

  if (closestSection) {
    setSectionState(closestSection);
  }

}


window.addEventListener(
  "scroll",
  updateSectionState,
  { passive: true }
);

window.addEventListener(
  "resize",
  updateSectionState
);

updateSectionState();

/* =========================================
   MICRO-EVENT SYSTEM
   ========================================= */

let idleTimer = null;
let isIdle = false;

function resetIdleState() {
  clearTimeout(idleTimer);

  if (isIdle) {
    isIdle = false;
    document.body.classList.remove("system-idle");
  }

  idleTimer = setTimeout(() => {
    isIdle = true;
    document.body.classList.add("system-idle");

    triggerMicroEvent();
  }, 4500);
}


/* -----------------------------------------
   TINY SYSTEM EVENT
   ----------------------------------------- */

function triggerMicroEvent() {

  const readySignals = [
    ...document.querySelectorAll(".system-row span:last-child"),
    ...document.querySelectorAll(".service-top span:last-child"),
    ...document.querySelectorAll(".note-corner-br")
  ];

  if (!readySignals.length) return;

  const target =
    readySignals[
      Math.floor(
        Math.random() * readySignals.length
      )
    ];

  target.classList.add("signal-flicker");

  setTimeout(() => {
    target.classList.remove("signal-flicker");
  }, 180);

}


/* -----------------------------------------
   USER ACTIVITY
   ----------------------------------------- */

window.addEventListener(
  "mousemove",
  resetIdleState,
  { passive: true }
);

window.addEventListener(
  "scroll",
  resetIdleState,
  { passive: true }
);

window.addEventListener(
  "click",
  resetIdleState,
  { passive: true }
);

resetIdleState();

  /* =========================================================
     SERVICE SCANNER
     ========================================================= */

  serviceModules.forEach((module) => {

    module.addEventListener(
      "mousemove",
      (event) => {

        const rect =
          module.getBoundingClientRect();

        const x =
          event.clientX - rect.left;

        const y =
          event.clientY - rect.top;

        const px =
          (x / rect.width - 0.5) * 2;

        const py =
          (y / rect.height - 0.5) * 2;


        module.style.setProperty(
          "--pointer-x",
          `${x}px`
        );

        module.style.setProperty(
          "--pointer-y",
          `${y}px`
        );

        module.style.setProperty(
          "--tilt-x",
          `${py * -2}deg`
        );

        module.style.setProperty(
          "--tilt-y",
          `${px * 2}deg`
        );

      }
    );


    module.addEventListener(
      "mouseleave",
      () => {

        module.style.setProperty(
          "--tilt-x",
          "0deg"
        );

        module.style.setProperty(
          "--tilt-y",
          "0deg"
        );

      }
    );

  });


  /* =========================================================
     PRICING SCANNER
     ========================================================= */

  priceNotes.forEach((note) => {

    note.addEventListener(
      "mousemove",
      (event) => {

        const rect =
          note.getBoundingClientRect();

        const x =
          event.clientX - rect.left;

        const y =
          event.clientY - rect.top;


        note.style.setProperty(
          "--pointer-x",
          `${x}px`
        );

        note.style.setProperty(
          "--pointer-y",
          `${y}px`
        );

      }
    );

  });


  /* =========================================================
     CONTACT LOCK
     ========================================================= */

  if (contactCommand) {

    contactCommand.addEventListener(
      "mouseenter",
      () => {
        pointer.classList.add(
          "is-locking"
        );
      }
    );

    contactCommand.addEventListener(
      "mouseleave",
      () => {
        pointer.classList.remove(
          "is-locking"
        );
      }
    );

  }


  /* =========================================================
     WORK CARD INTERACTION
     ========================================================= */

  document
    .querySelectorAll(".work-card")
    .forEach((card) => {

      const visual =
        card.querySelector(
          ".work-visual"
        );

      const center =
        card.querySelector(
          ".work-center"
        );


      card.addEventListener(
        "mousemove",
        (event) => {

          const rect =
            card.getBoundingClientRect();

          const x =
            event.clientX - rect.left;

          const y =
            event.clientY - rect.top;

          const px =
            (x / rect.width - 0.5) * 2;

          const py =
            (y / rect.height - 0.5) * 2;


          card.style.setProperty(
            "--pointer-x",
            `${x}px`
          );

          card.style.setProperty(
            "--pointer-y",
            `${y}px`
          );

          card.style.setProperty(
            "--work-rotate-x",
            `${py * -2.5}deg`
          );

          card.style.setProperty(
            "--work-rotate-y",
            `${px * 2.5}deg`
          );


          if (visual) {

            visual.style.setProperty(
              "--visual-x",
              `${px * 8}px`
            );

            visual.style.setProperty(
              "--visual-y",
              `${py * 8}px`
            );

          }


          if (center) {

            center.style.setProperty(
              "--center-x",
              `${px * 12}px`
            );

            center.style.setProperty(
              "--center-y",
              `${py * 12}px`
            );

          }

        }
      );


      card.addEventListener(
        "mouseenter",
        () => {

          card.classList.add(
            "project-active"
          );

          pointer.classList.add(
            "is-hovering"
          );

        }
      );


      card.addEventListener(
        "mouseleave",
        () => {

          card.classList.remove(
            "project-active"
          );

          card.style.setProperty(
            "--work-rotate-x",
            "0deg"
          );

          card.style.setProperty(
            "--work-rotate-y",
            "0deg"
          );


          if (visual) {

            visual.style.setProperty(
              "--visual-x",
              "0px"
            );

            visual.style.setProperty(
              "--visual-y",
              "0px"
            );

          }


          if (center) {

            center.style.setProperty(
              "--center-x",
              "0px"
            );

            center.style.setProperty(
              "--center-y",
              "0px"
            );

          }


          pointer.classList.remove(
            "is-hovering"
          );

        }
      );

    });

/* =========================================
   HERO — DIGITAL WEBGL MASK
   ========================================= */

(() => {

  if (typeof THREE === "undefined") {
    console.warn("Three.js is required for DIGITAL reveal.");
    return;
  }

  const digital =
  document.querySelector(".hero-digital");

if (!digital) return;

const digitalLetters =
  digital.querySelectorAll(".digital-letter");
  let activeLetter = null;

  digitalLetters.forEach((letter) => {

  letter.addEventListener(
    "mouseenter",
    () => {

      activeLetter = letter;

      const digitalRect =
        digital.getBoundingClientRect();

      const letterRect =
        letter.getBoundingClientRect();


      /* -----------------------------------
         LETTER RECT → WEBGL UV SPACE
         ----------------------------------- */

      const x =
        (
          letterRect.left -
          digitalRect.left
        ) /
        digitalRect.width;


      const top =
        (
          letterRect.top -
          digitalRect.top
        ) /
        digitalRect.height;


      const width =
        letterRect.width /
        digitalRect.width;


      const height =
        letterRect.height /
        digitalRect.height;


      const bottom =
        1 -
        top -
        height;


      gsap.to(
        material.uniforms.uHoverRect.value,
        {
          x: x,
          y: bottom,
          z: width,
          w: height,

          duration: 0.22,

          ease: "power2.out"
        }
      );


      /* REAL LETTER FADES OUT */

      gsap.to(
        letter,
        {
          opacity: 0,

          duration: 0.18,

          ease: "power2.out"
        }
      );


      /* GLYPH FADES IN */

      gsap.to(
        material.uniforms.uReveal,
        {
          value: 1,

          duration: 0.22,

          ease: "power2.out"
        }
      );

    }
  );


  letter.addEventListener(
    "mouseleave",
    () => {

      activeLetter = null;


      gsap.to(
        letter,
        {
          opacity: 1,

          duration: 0.22,

          ease: "power2.out"
        }
      );


      gsap.to(
        material.uniforms.uReveal,
        {
          value: 0,

          duration: 0.28,

          ease: "power2.out"
        }
      );

    }
  );

});


  /* =========================================
     CANVAS
     ========================================= */

  const canvas =
    document.createElement("canvas");

  canvas.className =
    "digital-webgl";

  digital.appendChild(canvas);


  /* =========================================
     RENDERER
     ========================================= */

  const renderer =
    new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance"
    });

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      2
    )
  );


  /* =========================================
     SCENE
     ========================================= */

  const scene =
    new THREE.Scene();


  const camera =
    new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0,
      1
    );


  /* =========================================
     MASK CANVAS
     ========================================= */

  const maskCanvas =
    document.createElement("canvas");

  const maskCtx =
    maskCanvas.getContext("2d");


  function rebuildMask() {

  const rect =
    digital.getBoundingClientRect();

  const styles =
    getComputedStyle(digital);

  const width =
    Math.max(
      1,
      Math.ceil(rect.width)
    );

  const height =
    Math.max(
      1,
      Math.ceil(rect.height)
    );


  maskCanvas.width = width;
  maskCanvas.height = height;


  maskCtx.clearRect(
    0,
    0,
    width,
    height
  );


  /* -----------------------------------------
     MATCH THE ACTUAL HERO TYPOGRAPHY
     ----------------------------------------- */

  const fontSize =
    parseFloat(styles.fontSize) || 16;

  const fontWeight =
    styles.fontWeight || "400";

  const fontFamily =
    styles.fontFamily || "sans-serif";


  maskCtx.font =
    `${fontWeight} ${fontSize}px ${fontFamily}`;


  maskCtx.fillStyle =
    "#ffffff";


  maskCtx.textAlign =
    "left";

  maskCtx.textBaseline =
    "alphabetic";


  /* -----------------------------------------
     MATCH LETTER SPACING
     ----------------------------------------- */

  let letterSpacing =
    parseFloat(styles.letterSpacing);


  if (!Number.isFinite(letterSpacing)) {
    letterSpacing = 0;
  }


  /*
    If CSS uses em, parseFloat above gives the
    numeric value but not the actual pixel value.
  */

  if (
    styles.letterSpacing.includes("em")
  ) {
    letterSpacing *= fontSize;
  }


  /* -----------------------------------------
     MEASURE TEXT
     ----------------------------------------- */

  const text =
    digital.textContent.trim();

  const metrics =
    maskCtx.measureText(text);


  const rawWidth =
    metrics.width;


  const spacingWidth =
    letterSpacing *
    Math.max(
      text.length - 1,
      0
    );


  const actualWidth =
    rawWidth +
    spacingWidth;


  /*
    Scale the text horizontally so the
    mask occupies the exact same width
    as the DOM element.
  */

  const scaleX =
    actualWidth > 0
      ? width / actualWidth
      : 1;


  maskCtx.save();

  maskCtx.scale(
    scaleX,
    1
  );


  /* -----------------------------------------
     VERTICAL ALIGNMENT
     ----------------------------------------- */

  const ascent =
    metrics.actualBoundingBoxAscent ||
    fontSize * 0.75;

  const descent =
    metrics.actualBoundingBoxDescent ||
    fontSize * 0.20;


  const textHeight =
    ascent + descent;


  const baseline =
    (
      height -
      textHeight
    ) * 0.5 +
    ascent;


  /* -----------------------------------------
     DRAW CHARACTER BY CHARACTER
     ----------------------------------------- */

  let x = 0;


  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const character =
      text[i];


    maskCtx.fillText(
      character,
      x,
      baseline
    );


    x +=
      maskCtx.measureText(
        character
      ).width +
      letterSpacing;

  }


  maskCtx.restore();
}

  rebuildMask();


  const maskTexture =
    new THREE.CanvasTexture(
      maskCanvas
    );

  maskTexture.minFilter =
    THREE.LinearFilter;

  maskTexture.magFilter =
    THREE.LinearFilter;


  /* =========================================
     SHADER
     ========================================= */

  const material =
    new THREE.ShaderMaterial({

      transparent: true,

      depthWrite: false,

      uniforms: {

        uMask: {
          value: maskTexture
        },

        uResolution: {
          value: new THREE.Vector2(
            maskCanvas.width,
            maskCanvas.height
          )
        },

        uMouse: {
          value: new THREE.Vector2(
            0.5,
            0.5
          )
        },

        uTime: {
          value: 0
        },

       uReveal: {
  value: 0
},

uHoverRect: {
  value: new THREE.Vector4(
    0,
    0,
    0,
    0
  )
}

      },


      vertexShader: `

        varying vec2 vUv;

        void main() {

          vUv =
            uv;

          gl_Position =
            vec4(
              position,
              1.0
            );

        }

      `,


      fragmentShader: `

  uniform sampler2D uMask;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uReveal;
  uniform vec4 uHoverRect;
  varying vec2 vUv;


  /* -----------------------------------
     HASH / NOISE
     ----------------------------------- */

  float hash(vec2 p) {

    return fract(
      sin(
        dot(
          p,
          vec2(
            127.1,
            311.7
          )
        )
      ) *
      43758.5453123
    );

  }


  /* -----------------------------------
     MAIN
     ----------------------------------- */

  void main() {

    /*
      Pixel size.
    */

    float pixelSize = 9.0;


    vec2 pixelCoord =
      floor(
        vUv *
        uResolution /
        pixelSize
      );

    vec2 cell =
      fract(
        vUv *
        uResolution /
        pixelSize
      );


    /*
      Cursor distance.
    */

    float distanceToMouse =
      distance(
        vUv,
        uMouse
      );


    float revealField =
      1.0 -
      smoothstep(
        0.03,
        0.42,
        distanceToMouse
      );


    /*
      Stronger disturbance close
      to the cursor.
    */

    float disturbance =
      revealField *
      revealField;


    /*
      Directional flow around cursor.
    */

    vec2 direction =
      normalize(
        vUv -
        uMouse +
        vec2(0.0001)
      );


    float flow =
      sin(
        uTime * 2.4 +
        hash(pixelCoord) * 6.28
      );


    vec2 displacedUv =
      vUv;

    displacedUv +=
      direction *
      disturbance *
      (
        0.012 +
        flow *
        0.006
      );


    /*
      Keep UVs safe.
    */

    displacedUv =
      clamp(
        displacedUv,
        0.001,
        0.999
      );


    /*
      ACTUAL DIGITAL MASK
    */

    float mask =
      texture2D(
        uMask,
        displacedUv
      ).a;


    /*
      Square pixel shape.
    */

    float square =
      step(
        0.14,
        cell.x
      ) *
      step(
        cell.x,
        0.86
      ) *
      step(
        0.14,
        cell.y
      ) *
      step(
        cell.y,
        0.86
      );


    /*
      Local pixel instability.
    */

    float noise =
      hash(
        pixelCoord +
        floor(
          uTime * 5.0
        )
      );


    /*
      Some pixels brighten.
    */

    float flicker =
      mix(
        0.72,
        1.0,
        noise
      );


    /*
      Rare glitch cells.
    */

    float glitch =
      step(
        0.94,
        hash(
          pixelCoord +
          floor(
            uTime * 3.0
          )
        )
      );


    /*
      Very small RGB-like displacement.
    */

    float redSignal =
      smoothstep(
        0.40,
        0.0,
        abs(
          distanceToMouse -
          0.17
        )
      );


    /*
      COLORS
    */

    vec3 blue =
      vec3(
        0.392,
        0.686,
        0.859
      );


    vec3 white =
      vec3(
        1.0
      );


    vec3 red =
      vec3(
        0.807,
        0.094,
        0.094
      );


    /*
      Mostly blue/white.
      Rare red signal cells.
    */

    vec3 color =
      mix(
        blue,
        white,
        noise * 0.45
      );


    color =
      mix(
        color,
        red,
        glitch *
        redSignal *
        0.85
      );


    /*
      Thin scanline influence.
    */

    float scan =
      0.92 +
      0.08 *
      sin(
        (
          vUv.y *
          uResolution.y
        ) *
        0.32 +
        uTime * 2.0
      );


    /*
      Final alpha.

      Important:
      mask means NOTHING escapes
      the actual DIGITAL letters.
    */
      /* -----------------------------------
   HOVERED LETTER MASK
   ----------------------------------- */

float rectLeft =
  uHoverRect.x;

float rectBottom =
  uHoverRect.y;

float rectRight =
  uHoverRect.x +
  uHoverRect.z;

float rectTop =
  uHoverRect.y +
  uHoverRect.w;


/*
  Soft edge around the active letter.
*/

float edgeX =
  smoothstep(
    rectLeft,
    rectLeft + 0.012,
    vUv.x
  ) *
  smoothstep(
    rectRight,
    rectRight - 0.012,
    vUv.x
  );

float edgeY =
  smoothstep(
    rectBottom,
    rectBottom + 0.02,
    vUv.y
  ) *
  smoothstep(
    rectTop,
    rectTop - 0.02,
    vUv.y
  );


float letterArea =
  edgeX *
  edgeY;

    float alpha =
  mask *
  letterArea *
  square *
  flicker *
  scan *
  uReveal *
  (
    0.28 +
    disturbance * 0.85
  );


    gl_FragColor =
      vec4(
        color,
        alpha
      );

  }

`

    });


  /* =========================================
     PLANE
     ========================================= */

  const geometry =
    new THREE.PlaneGeometry(
      2,
      2
    );


  const mesh =
    new THREE.Mesh(
      geometry,
      material
    );


  scene.add(mesh);


  /* =========================================
     RESIZE / POSITION
     ========================================= */

  function resize() {

    const rect =
      digital.getBoundingClientRect();


    renderer.setSize(
      rect.width,
      rect.height,
      false
    );


    material.uniforms.uResolution.value.set(
      rect.width,
      rect.height
    );


    rebuildMask();

    maskTexture.needsUpdate = true;


    canvas.style.width =
      `${rect.width}px`;

    canvas.style.height =
      `${rect.height}px`;

  }


  resize();


  window.addEventListener(
    "resize",
    resize
  );


  /* =========================================
     CURSOR
     ========================================= */

  let mouseTargetX = 0.5;
  let mouseTargetY = 0.5;

  let mouseCurrentX = 0.5;
  let mouseCurrentY = 0.5;


  digital.addEventListener(
    "mouseenter",
    () => {

      gsap.to(
        material.uniforms.uReveal,
        {
          value: 1,
          duration: 0.35,
          ease: "power2.out"
        }
      );

    }
  );


 digital.addEventListener(
  "mousemove",
  (event) => {

    const rect =
      digital.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    mouseTargetX =
      x / rect.width;

    mouseTargetY =
      1 -
      (y / rect.height);

    digital.style.setProperty(
      "--digital-x",
      `${x}px`
    );

    digital.style.setProperty(
      "--digital-y",
      `${y}px`
    );


    /* -----------------------------------------
       FIND LETTER UNDER CURSOR
       ----------------------------------------- */

    let activeLetter = null;

    digitalLetters.forEach(
      (letter) => {

        const letterRect =
          letter.getBoundingClientRect();

        if (
          event.clientX >= letterRect.left &&
          event.clientX <= letterRect.right &&
          event.clientY >= letterRect.top &&
          event.clientY <= letterRect.bottom
        ) {

          activeLetter = letter;

        }

      }
    );


    digitalLetters.forEach(
      (letter) => {

        letter.classList.toggle(
          "is-replaced",
          letter === activeLetter
        );

      }
    );

  }
);


  digital.addEventListener(
    "mouseleave",
    () => {

      gsap.to(
        material.uniforms.uReveal,
        {
          value: 0,
          duration: 0.45,
          ease: "power2.out"
        }
      );

    }
  );


  /* =========================================
     LOOP
     ========================================= */

  const clock =
    new THREE.Clock();


  function animate() {

    requestAnimationFrame(
      animate
    );


    const time =
      clock.getElapsedTime();


    mouseCurrentX +=
      (
        mouseTargetX -
        mouseCurrentX
      ) * 0.12;


    mouseCurrentY +=
      (
        mouseTargetY -
        mouseCurrentY
      ) * 0.12;


    material.uniforms.uMouse.value.set(
      mouseCurrentX,
      mouseCurrentY
    );


    material.uniforms.uTime.value =
      time;


    renderer.render(
      scene,
      camera
    );

  }


  animate();


  /* =========================================
     RESET AFTER SCROLL / LAYOUT CHANGES
     ========================================= */

  window.addEventListener(
    "scroll",
    () => {
      resize();
    },
    {
      passive: true
    }
  );


})();

/* =========================================
   HERO — WE BUILD INTERACTION
   ========================================= */

const buildLine =
  document.querySelector(".hero-line:first-of-type");

if (buildLine) {

  let buildEnterTween = null;
  let buildJitterTween = null;

  buildLine.addEventListener(
    "mouseenter",
    () => {

      buildLine.classList.add(
        "is-build-active"
      );

      buildLine.style.setProperty(
        "--build-intensity",
        "1"
      );

      /* Initial CRT sweep */
      buildEnterTween = gsap.fromTo(
        buildLine,
        {
          x: -5
        },
        {
          x: 0,
          duration: 0.22,
          ease: "power3.out"
        }
      );

    }
  );


  buildLine.addEventListener(
    "mousemove",
    (event) => {

      const rect =
        buildLine.getBoundingClientRect();

      const x =
        (
          event.clientX -
          rect.left
        ) /
        rect.width *
        100;

      const y =
        (
          event.clientY -
          rect.top
        ) /
        rect.height *
        100;


      buildLine.style.setProperty(
        "--build-signal-x",
        `${x}%`
      );

      buildLine.style.setProperty(
        "--build-signal-y",
        `${y}%`
      );


      /*
        Movement creates tiny CRT instability.
        It stays very small so the typography
        never becomes unreadable.
      */

      if (buildJitterTween) {
        buildJitterTween.kill();
      }

      buildJitterTween = gsap.to(
        buildLine,
        {
          x: gsap.utils.random(-1.5, 1.5),
          y: gsap.utils.random(-0.8, 0.8),
          duration: 0.07,
          ease: "none",
          overwrite: true
        }
      );

    }
  );


  buildLine.addEventListener(
    "mouseleave",
    () => {

      buildLine.classList.remove(
        "is-build-active"
      );

      buildLine.style.setProperty(
        "--build-intensity",
        "0"
      );


      buildLine.style.setProperty(
        "--build-signal-x",
        "50%"
      );

      buildLine.style.setProperty(
        "--build-signal-y",
        "50%"
      );


      gsap.to(
        buildLine,
        {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power3.out"
        }
      );

    }
  );

}


  /* =========================================================
     GSAP
     ========================================================= */

  const hasGSAP =
    typeof gsap !== "undefined";

  const hasScrollTrigger =
    typeof ScrollTrigger !== "undefined";


  if (hasGSAP && hasScrollTrigger) {

    gsap.registerPlugin(
      ScrollTrigger
    );


    /* =====================================================
       STANDARD SECTION REVEALS
       ===================================================== */


    if (workGrid) {

      gsap.from(workGrid, {

        y: 70,
        opacity: 0,

        duration: 1,

        ease: "power3.out",

        scrollTrigger: {

          trigger: workGrid,

          start: "top 88%",

          toggleActions:
            "play none none reverse"

        }

      });

    }


    if (serviceModules.length) {

      gsap.from(
        serviceModules,
        {

          y: 65,
          opacity: 0,

          duration: 0.9,

          stagger: 0.10,

          ease: "power3.out",

          scrollTrigger: {

            trigger:
              ".services-list",

            start: "top 85%",

            toggleActions:
              "play none none reverse"

          }

        }
      );

    }


    if (priceNotes.length) {

      gsap.from(
        priceNotes,
        {

          y: 75,
          opacity: 0,
          scale: 0.98,

          duration: 0.9,

          stagger: 0.10,

          ease: "power3.out",

          scrollTrigger: {

            trigger:
              ".pricing-notes",

            start: "top 85%",

            toggleActions:
              "play none none reverse"

          }

        }
      );

    }


    if (contactTitle) {

      gsap.from(
        contactTitle,
        {

          y: 70,
          opacity: 0,

          duration: 1,

          ease: "power3.out",

          scrollTrigger: {

            trigger: contactTitle,

            start: "top 88%",

            toggleActions:
              "play none none reverse"

          }

        }
      );

    }


    if (contactCommand) {

      gsap.from(
        contactCommand,
        {

          y: 35,
          opacity: 0,

          duration: 0.8,

          delay: 0.1,

          ease: "power3.out",

          scrollTrigger: {

            trigger:
              contactCommand,

            start: "top 90%",

            toggleActions:
              "play none none reverse"

          }

        }
      );

    }


  }


  /* =========================================================
     SERVICE MICRO PARALLAX
     ========================================================= */

  if (hasGSAP && hasScrollTrigger) {

    serviceModules.forEach(
      (module, index) => {

        gsap.to(module, {

          yPercent:
            index % 2 === 0
              ? -2
              : 2,

          ease: "none",

          scrollTrigger: {

            trigger: module,

            start: "top bottom",

            end: "bottom top",

            scrub: 1.2

          }

        });

      }
    );

  }


  /* =========================================================
     FINAL REFRESH
     ========================================================= */

  if (hasScrollTrigger) {

    window.addEventListener(
      "load",
      () => {

        ScrollTrigger.refresh();

      }
    );

  }

  /* =========================================
   INSERT_NAME — HERO → ABOUT
   SCROLL CHOREOGRAPHY
   ========================================= */

if (
  typeof gsap !== "undefined" &&
  typeof ScrollTrigger !== "undefined"
) {

  gsap.registerPlugin(ScrollTrigger);

  const hero = document.querySelector(".hero");
  const heroTitle = document.querySelector(".hero-title");
  const heroLines = gsap.utils.toArray(".hero-line");

  const about = document.querySelector(".about");
  const aboutInfo = document.querySelector(".about-information");
  const aboutSystem = document.querySelector(".about-system");

  if (
    hero &&
    heroTitle &&
    heroLines.length &&
    about &&
    aboutInfo &&
    aboutSystem
  ) {

    /* -----------------------------------------
       INITIAL STATES
       ----------------------------------------- */

    gsap.set(aboutInfo, {
      y: 90,
      opacity: 0
    });

    gsap.set(aboutSystem, {
      x: 110,
      y: 35,
      opacity: 0
    });


    /* -----------------------------------------
       HERO → ABOUT MASTER TIMELINE
       ----------------------------------------- */

    const heroAbout = gsap.timeline({
      paused: true,
      defaults: {
        ease: "none"
      }
    });


    /* -----------------------------------------
       HERO MASTER DEPTH
       ----------------------------------------- */

    heroAbout.to(
      heroTitle,
      {
        y: "-18vh",
        z: -180,
        scale: 0.82,
        rotateX: 2,
        rotateZ: -1.2,
        transformOrigin: "50% 50%",
        opacity: 0.22,
        duration: 1
      },
      0
    );


    /* -----------------------------------------
       LINE 1 — PULLS LEFT / BACK
       ----------------------------------------- */

    if (heroLines[0]) {

      heroAbout.to(
        heroLines[0],
        {
          x: "-7vw",
          y: "4vh",
          z: -70,
          scale: 0.95,
          rotateZ: -0.8,
          opacity: 0.72,
          duration: 1
        },
        0
      );

    }


    /* -----------------------------------------
       LINE 2 — STAYS NEAR CENTER
       ----------------------------------------- */

    if (heroLines[1]) {

      heroAbout.to(
        heroLines[1],
        {
          x: "2vw",
          y: "-1vh",
          z: -120,
          scale: 0.91,
          rotateZ: 0.35,
          opacity: 0.60,
          duration: 1
        },
        0
      );

    }


    /* -----------------------------------------
       LINE 3 — PULLS RIGHT / FURTHER BACK
       ----------------------------------------- */

    if (heroLines[2]) {

      heroAbout.to(
        heroLines[2],
        {
          x: "9vw",
          y: "-4vh",
          z: -200,
          scale: 0.86,
          rotateZ: -0.45,
          opacity: 0.28,
          duration: 1
        },
        0
      );

    }


    /* -----------------------------------------
       ABOUT LEFT
       ----------------------------------------- */

    heroAbout.to(
      aboutInfo,
      {
        y: 0,
        opacity: 1,
        duration: 0.72,
        ease: "power3.out"
      },
      0.28
    );


    /* -----------------------------------------
       ABOUT RIGHT
       ----------------------------------------- */

    heroAbout.to(
      aboutSystem,
      {
        x: 0,
        y: 0,
        opacity: 1,
        duration: 0.80,
        ease: "power3.out"
      },
      0.36
    );


    /* -----------------------------------------
       TINY ENVIRONMENTAL DEPTH SHIFT
       ----------------------------------------- */

    heroAbout.to(
      hero,
      {
        scale: 0.985,
        duration: 0.5,
        ease: "power2.out"
      },
      0.42
    );


    /* -----------------------------------------
       SCROLL DRIVER
       ----------------------------------------- */

    ScrollTrigger.create({

      trigger: about,

      start: "top 88%",

      end: "top 28%",

      scrub: 1.15,

      onUpdate: (self) => {
        heroAbout.progress(self.progress);
      }

    });

  }

}

/* =========================================================
   INSERT_NAME — RETRO PONG BACKGROUND
   ========================================================= */

(() => {

  const canvas = document.createElement("canvas");
  canvas.className = "pong-background";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");

  if (!ctx) return;


  /* =======================================================
     VIEWPORT
     ======================================================= */

  let width = 0;
  let height = 0;
  let dpr = 1;


  /* =======================================================
     FIELD
     ======================================================= */

  let fieldLeft = 0;
  let fieldRight = 0;
  let fieldTop = 0;
  let fieldBottom = 0;


  /* =======================================================
     GAME
     ======================================================= */

  const paddleWidth = 8;
  const paddleHeight = 110;
  const ballSize = 7;

  const baseSpeed = 470;


  const ball = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0
  };


  const leftPaddle = {
    y: 0
  };


  const rightPaddle = {
    y: 0
  };


  let leftScore = 0;
  let rightScore = 0;

  let lastTime = 0;


  /* =======================================================
     RESIZE
     ======================================================= */

  function resize() {

    width = window.innerWidth;
    height = window.innerHeight;

    dpr = Math.min(
      window.devicePixelRatio || 1,
      1.5
    );


    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;


    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    /*
      Full viewport.
      No arena/frame.
    */

    fieldLeft = 0;
    fieldRight = width;

    fieldTop = 0;
    fieldBottom = height;


    leftPaddle.y =
      height * 0.5;

    rightPaddle.y =
      height * 0.5;


    resetBall(
      Math.random() > 0.5
        ? 1
        : -1
    );

  }


  window.addEventListener(
    "resize",
    resize,
    { passive: true }
  );


  /* =======================================================
     SERVE
     ======================================================= */

  function resetBall(direction) {

    ball.x =
      width * 0.5;

    ball.y =
      height * 0.5;


    const angle =
      Math.random() * 0.55 - 0.275;


    ball.vx =
      Math.cos(angle) *
      baseSpeed *
      direction;


    ball.vy =
      Math.sin(angle) *
      baseSpeed;

  }


  /* =======================================================
     PADDLE AI
     ======================================================= */

  function updatePaddles(dt) {

    /*
      Left paddle.
    */

    const leftTarget =
      ball.y;


    const leftDifference =
      leftTarget -
      leftPaddle.y;


    leftPaddle.y +=
      Math.max(
        -540 * dt,
        Math.min(
          540 * dt,
          leftDifference
        )
      );


    /*
      Right paddle has a tiny
      reaction imperfection.
    */

    const rightTarget =
      ball.y +
      Math.sin(
        performance.now() *
        0.0013
      ) *
      18;


    const rightDifference =
      rightTarget -
      rightPaddle.y;


    rightPaddle.y +=
      Math.max(
        -500 * dt,
        Math.min(
          500 * dt,
          rightDifference
        )
      );


    /*
      Keep paddles inside screen.
    */

    const minY =
      paddleHeight * 0.5;

    const maxY =
      height -
      paddleHeight * 0.5;


    leftPaddle.y =
      Math.max(
        minY,
        Math.min(
          maxY,
          leftPaddle.y
        )
      );


    rightPaddle.y =
      Math.max(
        minY,
        Math.min(
          maxY,
          rightPaddle.y
        )
      );

  }


  /* =======================================================
     BALL PHYSICS
     ======================================================= */

  function updateBall(dt) {

    ball.x +=
      ball.vx * dt;

    ball.y +=
      ball.vy * dt;


    /* -----------------------------------------------------
       TOP
       ----------------------------------------------------- */

    if (
      ball.y -
      ballSize * 0.5 <= 0
    ) {

      ball.y =
        ballSize * 0.5;

      ball.vy =
        Math.abs(ball.vy);

    }


    /* -----------------------------------------------------
       BOTTOM
       ----------------------------------------------------- */

    if (
      ball.y +
      ballSize * 0.5 >= height
    ) {

      ball.y =
        height -
        ballSize * 0.5;

      ball.vy =
        -Math.abs(ball.vy);

    }


    /* -----------------------------------------------------
       LEFT PADDLE
       ----------------------------------------------------- */

    const leftX =
      8;


    if (
      ball.vx < 0 &&

      ball.x -
      ballSize * 0.5 <=
      leftX + paddleWidth &&

      ball.x +
      ballSize * 0.5 >=
      leftX &&

      ball.y >=
      leftPaddle.y -
      paddleHeight * 0.5 &&

      ball.y <=
      leftPaddle.y +
      paddleHeight * 0.5
    ) {

      ball.x =
        leftX +
        paddleWidth +
        ballSize * 0.5;


      const impact =
        (
          ball.y -
          leftPaddle.y
        ) /
        (
          paddleHeight *
          0.5
        );


      ball.vy =
        impact *
        baseSpeed *
        0.85;


      ball.vx =
        Math.abs(ball.vx) *
        1.025;

    }


    /* -----------------------------------------------------
       RIGHT PADDLE
       ----------------------------------------------------- */

    const rightX =
      width -
      8 -
      paddleWidth;


    if (
      ball.vx > 0 &&

      ball.x +
      ballSize * 0.5 >=
      rightX &&

      ball.x -
      ballSize * 0.5 <=
      rightX +
      paddleWidth &&

      ball.y >=
      rightPaddle.y -
      paddleHeight * 0.5 &&

      ball.y <=
      rightPaddle.y +
      paddleHeight * 0.5
    ) {

      ball.x =
        rightX -
        ballSize * 0.5;


      const impact =
        (
          ball.y -
          rightPaddle.y
        ) /
        (
          paddleHeight *
          0.5
        );


      ball.vy =
        impact *
        baseSpeed *
        0.85;


      ball.vx =
        -Math.abs(ball.vx) *
        1.025;

    }


    /* -----------------------------------------------------
       SCORE
       ----------------------------------------------------- */

    if (
      ball.x < -20
    ) {

      rightScore++;

      resetBall(1);

    }


    if (
      ball.x > width + 20
    ) {

      leftScore++;

      resetBall(-1);

    }

  }


  /* =======================================================
     DRAW
     ======================================================= */

  function draw() {

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    /* -----------------------------------------------------
       CENTRE LINE
       ----------------------------------------------------- */

    ctx.strokeStyle =
      "rgba(255,255,255,0.62)";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
      width * 0.5,
      0
    );

    ctx.lineTo(
      width * 0.5,
      height
    );

    ctx.stroke();


    /* -----------------------------------------------------
       SCORE
       ----------------------------------------------------- */

    ctx.font =
      "700 52px monospace";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "top";

    ctx.fillStyle =
      "rgba(255,255,255,0.60)";


    ctx.fillText(
      String(leftScore)
        .padStart(2, "0"),

      width * 0.46,
      28
    );


    ctx.fillText(
      String(rightScore)
        .padStart(2, "0"),

      width * 0.54,
      28
    );


    /* -----------------------------------------------------
       LEFT PADDLE — BLUE
       ----------------------------------------------------- */

    ctx.fillStyle =
      "#64afdb";


    ctx.fillRect(
      8,

      leftPaddle.y -
      paddleHeight * 0.5,

      paddleWidth,
      paddleHeight
    );


    /* -----------------------------------------------------
       RIGHT PADDLE — RED
       ----------------------------------------------------- */

    ctx.fillStyle =
      "#ce1818";


    ctx.fillRect(
      width -
      8 -
      paddleWidth,

      rightPaddle.y -
      paddleHeight * 0.5,

      paddleWidth,
      paddleHeight
    );


    /* -----------------------------------------------------
       BALL — WHITE
       ----------------------------------------------------- */

    ctx.fillStyle =
      "#ffffff";


    ctx.fillRect(
      ball.x -
      ballSize * 0.5,

      ball.y -
      ballSize * 0.5,

      ballSize,
      ballSize
    );

  }


  /* =======================================================
     LOOP
     ======================================================= */

  function loop(timestamp) {

    if (!lastTime) {
      lastTime = timestamp;
    }


    let dt =
      (
        timestamp -
        lastTime
      ) / 1000;


    lastTime =
      timestamp;


    /*
      Prevent huge jumps when the
      browser tab becomes inactive.
    */

    dt =
      Math.min(
        dt,
        0.05
      );


    updatePaddles(dt);

    updateBall(dt);

    draw();


    requestAnimationFrame(
      loop
    );

  }


  /* =======================================================
     START
     ======================================================= */

  resize();

  requestAnimationFrame(
    loop
  );

})();
});