// =============================================================================
// MOCK DB — LIVE STREAMS COLLECTION
// =============================================================================
// Schema: liveStreams {
//   _id, artist_id, title, description, video_url, thumbnail_url,
//   started_at, scheduled_duration_sec
// }
//
// 💡 จำลอง live ยังไง:
//   - video_url = คลิปสั้น loop วน (ไฟล์เล็ก deploy ง่าย)
//   - started_at = เวลาที่ live เริ่ม
//   - frontend คำนวณ "ตอนนี้ควรเล่นวินาทีที่เท่าไหร่"
//     → ทุกคนเปิดเห็นจุดเดียวกัน (sync กัน เหมือน live จริง)
//   - ห้าม seek/pause → controlsList="nodownload noseek" + dis pause logic
// =============================================================================

export const liveStreams = [
  {
    _id: "live_001",
    artist_id: "artist_002", // Velvet Crows
    title: "The Nightmares Show — Live Session",
    description:
      "Late-night indie rock session live from Chiang Mai. Tune in for new tracks and old favorites.",
    // คลิปสั้น (public sample) — Big Buck Bunny หรือ Pexels free clip
    // ถ้าจะ deploy จริง แนะนำหาคลิปที่ free และไฟล์เล็ก
    video_url:
      "https://res.cloudinary.com/dfyh90ba4/video/upload/v1780043975/BABYMONSTER_%EB%B2%A0%EC%9D%B4%EB%B9%84%EB%AA%AC%EC%8A%A4%ED%84%B0_-_CHOOM_%EC%B6%A4___Show_MusicCore___MBC260509%EB%B0%A9%EC%86%A1_vwl3hp.mp4",
    thumbnail_url: "/covers/coversong-14.jpg", // Dark Romantics cover
    started_at: new Date(Date.now() - 47 * 60 * 1000), // started 47 min ago
    scheduled_duration_sec: 4 * 60 * 60, // 4 hours
  },
  {
    _id: "live_002",
    artist_id: "artist_003", // Crystal Mall
    title: "Mall After Hours — Synthwave Live",
    description:
      "Five hours of nonstop synthwave. Empty mall vibes, neon lights, vaporwave aesthetics.",
    video_url:
      "https://res.cloudinary.com/dfyh90ba4/video/upload/v1780043975/BABYMONSTER_%EB%B2%A0%EC%9D%B4%EB%B9%84%EB%AA%AC%EC%8A%A4%ED%84%B0_-_CHOOM_%EC%B6%A4___Show_MusicCore___MBC260509%EB%B0%A9%EC%86%A1_vwl3hp.mp4",
    thumbnail_url: "/covers/coversong-25.jpg",
    started_at: new Date(Date.now() - 23 * 60 * 1000),
    scheduled_duration_sec: 5 * 60 * 60,
  },
  {
    _id: "live_003",
    artist_id: "artist_006", // Mira Sol
    title: "Cabin Sessions — Acoustic Live",
    description:
      "Acoustic folk from a cabin in Pai. Birds singing, wood crackling, gentle guitar.",
    video_url:
      "https://res.cloudinary.com/dfyh90ba4/video/upload/v1780043975/BABYMONSTER_%EB%B2%A0%EC%9D%B4%EB%B9%84%EB%AA%AC%EC%8A%A4%ED%84%B0_-_CHOOM_%EC%B6%A4___Show_MusicCore___MBC260509%EB%B0%A9%EC%86%A1_vwl3hp.mp4",
    thumbnail_url: "/covers/coversong-32.jpg",
    started_at: new Date(Date.now() - 1 * 60 * 60 * 1000 - 15 * 60 * 1000), // 1h 15m ago
    scheduled_duration_sec: 3 * 60 * 60,
  },
  {
    _id: "live_004",
    artist_id: "artist_008",
    title: "Stream ลับ JSD12",
    description:
      "เต้นจนกว่าเพื่อนๆในกลุ่มผมจะทำโปรเจ็คเสร็จ",
    video_url:
      "https://res.cloudinary.com/dahzhfxua/video/upload/v1780929596/Final_1_b3xa7x.mp4",
    thumbnail_url: "/covers/coversong-32.jpg",
    started_at: new Date(Date.now() - 1 * 60 * 60 * 1000 - 15 * 60 * 1000), // 1h 15m ago
    scheduled_duration_sec: 3 * 60 * 60,
  },
];

/*
═══════════════════════════════════════════════════════════════
SUMMARY: 3 live streams (อนาคต admin จัดการได้)

🎬 Live ปัจจุบัน (จำลอง):
   live_001  Velvet Crows  — เริ่มไปแล้ว 47 min
   live_002  Crystal Mall  — เริ่มไปแล้ว 23 min
   live_003  Mira Sol      — เริ่มไปแล้ว 1h 15m

💡 อนาคต: admin โพสต์ live ผ่าน dashboard, status auto-end
═══════════════════════════════════════════════════════════════
*/
