const revealElements = document.querySelectorAll(".reveal");
const tiltCards = document.querySelectorAll(".tilt-card");
const orbs = document.querySelectorAll(".bg-orb");
const hero = document.querySelector(".hero");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const connectForm = document.querySelector("#connect-form");
const formStatus = document.querySelector("#form-status");
const sendBtn = connectForm ? connectForm.querySelector(".send-btn") : null;

const emailJsConfig = {
  publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  serviceId: "YOUR_EMAILJS_SERVICE_ID",
  templateId: "YOUR_EMAILJS_TEMPLATE_ID",
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealElements.forEach((el, i) => {
  el.style.transitionDelay = `${i * 100}ms`;
  observer.observe(el);
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) * 2 - 1) * 8;
    const rotateX = -((y / rect.height) * 2 - 1) * 8;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
  });
});

const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const interactiveTargets = document.querySelectorAll(
  "a, button, .btn, .tilt-card, nav a, .social-row a"
);

if (hasFinePointer && cursorDot && cursorRing) {
  document.body.classList.add("custom-cursor-enabled");

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let dotScale = 1;
  let ringScale = 1;
  const dotSize = 8;
  const ringSize = 34;

  const animateCursor = () => {
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;

    cursorDot.style.transform = `translate3d(${mouseX - dotSize / 2}px, ${mouseY - dotSize / 2}px, 0) scale(${dotScale})`;
    cursorRing.style.transform = `translate3d(${ringX - ringSize / 2}px, ${ringY - ringSize / 2}px, 0) scale(${ringScale})`;
    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    document.body.classList.add("cursor-visible");
  });

  window.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-visible");
  });

  interactiveTargets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      document.body.classList.add("cursor-hover");
      dotScale = 0.75;
      ringScale = 1.65;
    });
    el.addEventListener("mouseleave", () => {
      document.body.classList.remove("cursor-hover");
      dotScale = 1;
      ringScale = 1;
    });
  });
}

window.addEventListener("mousemove", (event) => {
  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;

  if (hero) {
    const hx = clamp((x - 0.5) * 16, -8, 8);
    const hy = clamp((y - 0.5) * 16, -8, 8);
    hero.style.transform = `translate3d(${hx}px, ${hy}px, 0)`;
  }

  orbs.forEach((orb, i) => {
    const depth = (i + 1) * 10;
    const ox = (x - 0.5) * depth;
    const oy = (y - 0.5) * depth;
    orb.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
  });
});

if (connectForm && sendBtn && formStatus) {
  connectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = connectForm.name.value.trim();
    const email = connectForm.email.value.trim();
    const message = connectForm.message.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = "Please fill out all fields.";
      formStatus.className = "form-status error";
      return;
    }

    if (
      !window.emailjs ||
      emailJsConfig.publicKey.includes("YOUR_") ||
      emailJsConfig.serviceId.includes("YOUR_") ||
      emailJsConfig.templateId.includes("YOUR_")
    ) {
      formStatus.textContent =
        "Email setup is pending. Add EmailJS keys in script.js first.";
      formStatus.className = "form-status error";
      return;
    }

    const now = new Date();
    const formattedMessage = [
      "NEW CONTACT FORM SUBMISSION",
      "--------------------------------",
      `Name: ${name}`,
      `Email: ${email}`,
      `Message: ${message}`,
      `Date: ${now.toLocaleString()}`,
      "Source: PB Studios Website - Let's Connect Form",
    ].join("\n");

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";
    formStatus.textContent = "";
    formStatus.className = "form-status";

    try {
      window.emailjs.init({ publicKey: emailJsConfig.publicKey });
      await window.emailjs.send(
        emailJsConfig.serviceId,
        emailJsConfig.templateId,
        {
          from_name: name,
          from_email: email,
          message,
          formatted_message: formattedMessage,
          subject: `New PB Studios lead from ${name}`,
          submitted_at: now.toISOString(),
        }
      );

      connectForm.reset();
      formStatus.textContent = "Message sent successfully.";
      formStatus.className = "form-status success";
    } catch (error) {
      formStatus.textContent = "Failed to send. Please try again.";
      formStatus.className = "form-status error";
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send Message";
    }
  });
}
