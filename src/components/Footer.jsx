import React from "react";
import cassetteImg from "../assets/cas3.avif";
import vinylImg from "../assets/vin.avif";
import cdsImg from "../assets/cd.avif";
import tshirtImg from "../assets/t.webp";

// ข้อมูลสำหรับ Genre Chips
const GENRES = [
  "Rock",
  "Alternative",
  "Electronic",
  "Metal",
  "Pop",
  "Jazz",
  "Hip-hop / Rap",
  "Blues",
  "Classical",
  "J-pop",
  "K-pop",
  "Thai",
  "R&B",
  "หมอลำ",
  "EDM",
  "Anime",
  "DnB",
];

// ข้อมูลสำหรับหมวดหมู่สินค้า
const CATEGORIES = [
  {
    id: 1,
    title: "CASSETTES",
    img: cassetteImg,
  },
  { id: 2, title: "VINYL", img: vinylImg },
  { id: 3, title: "CDS", img: cdsImg },
  {
    id: 4,
    title: "T-SHIRTS",
    img: tshirtImg,
  },
];

const Footer = () => {
  return (
    <footer style={styles.footerContainer}>
      {/* 1. Genre Chips Section */}
      <div style={styles.genreWrapper}>
        {GENRES.map((genre, index) => (
          <button key={index} style={styles.genreChip}>
            {genre}
          </button>
        ))}
        {/* แถวที่สอง (ตามตัวอย่างภาพมีการซ้ำบางส่วน) */}
        {GENRES.slice(5, 17).map((genre, index) => (
          <button key={`row2-${index}`} style={styles.genreChip}>
            {genre}
          </button>
        ))}
      </div>

      {/* 2. Category Cards Section */}
      <div style={styles.categoryWrapper}>
        {CATEGORIES.map((item) => (
          <div key={item.id} style={styles.card}>
            <img src={item.img} alt={item.title} style={styles.cardImg} />
            <div style={styles.cardOverlay}>
              <span style={styles.cardTitle}>{item.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom Links & Bar */}
      <div style={styles.bottomSection}>
        <nav style={styles.navLinks}>
          <a href="#about" style={styles.link}>
            About us
          </a>
          <a href="#help" style={styles.link}>
            Help
          </a>
          <a href="#terms" style={styles.link}>
            Terms and conditions
          </a>
        </nav>

        {/* แถบยาวด้านล่างสุด */}
        <div style={styles.bottomBar}></div>
      </div>
    </footer>
  );
};

// Inline Styles (เพื่อให้จบในไฟล์เดียว หรือนำไปแยกใส่ CSS ภายหลังได้)
const styles = {
  footerContainer: {
    backgroundColor: "#0a0a14",
    padding: "60px 40px 30px 40px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  genreWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "center",
    maxWidth: "1000px",
    marginBottom: "60px",
  },
  genreChip: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "20px",
    color: "#e0e0e0",
    padding: "6px 20px",
    fontSize: "14px",
    cursor: "pointer",
  },
  categoryWrapper: {
    display: "flex",
    gap: "20px",
    marginBottom: "80px",
  },
  card: {
    width: "180px",
    height: "180px",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    backgroundColor: "#1a1a2a",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: "0.6",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: "20px",
  },
  cardTitle: {
    fontWeight: "bold",
    letterSpacing: "1px",
    fontSize: "14px",
  },
  bottomSection: {
    width: "100%",
    maxWidth: "1100px",
  },
  navLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "40px",
  },
  link: {
    color: "#8e8e9e",
    textDecoration: "none",
    fontSize: "13px",
    width: "fit-content",
  },
  bottomBar: {
    width: "100%",
    height: "24px",
    backgroundColor: "#2a2a3a",
    borderRadius: "12px",
  },
};

export default Footer;
