// Course Studio - Deck Rows Interface
// Updated: Replace D-ID / fake progress with REAL Runway text->video via Netlify Functions
// Requires Netlify functions:
//   /.netlify/functions/generate-runway-video
//   /.netlify/functions/get-runway-task

let courseDecks = {
  safety: [
    {
      id: 'safety-workplace',
      title: 'Workplace Safety',
      subtitle: 'Essential safety procedures',
      slideCount: 8,
      slides: [
        {
          id: 1,
          heading: "Welcome to Safety Training",
          content: "Learn essential workplace safety procedures to protect yourself and your colleagues.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
          hasVideo: false,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        },
        {
          id: 2,
          heading: "Personal Protective Equipment",
          content: "Understanding the importance of PPE and proper usage guidelines.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop",
          hasVideo: true,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        },
        {
          id: 3,
          heading: "Hazard Identification",
          content: "Recognize potential workplace hazards and implement safety protocols.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800&fit=crop",
          hasVideo: false,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        },
        {
          id: 4,
          heading: "Emergency Procedures",
          content: "Step-by-step emergency response protocols for various workplace situations.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop",
          hasVideo: true,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        }
      ]
    },
    {
      id: 'safety-ppe',
      title: 'PPE Guidelines',
      subtitle: 'Personal protective equipment standards',
      slideCount: 6,
      slides: [
        {
          id: 1,
          heading: "PPE Overview",
          content: "Introduction to personal protective equipment requirements.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop",
          hasVideo: true,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        },
        {
          id: 2,
          heading: "PPE Selection",
          content: "Choosing the right protective equipment for your job.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800&fit=crop",
          hasVideo: false,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        }
      ]
    }
  ],
  technical: [
    {
      id: 'tech-software',
      title: 'Software Training',
      subtitle: 'Professional software skills',
      slideCount: 12,
      slides: [
        {
          id: 1,
          heading: "Software Fundamentals",
          content: "Learn the basics of professional software tools.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800&fit=crop",
          hasVideo: true,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        },
        {
          id: 2,
          heading: "Advanced Features",
          content: "Master advanced functionality and workflows.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop",
          hasVideo: true,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        }
      ]
    }
  ],
  business: [
    {
      id: 'biz-customer',
      title: 'Customer Service',
      subtitle: 'Excellence in customer relations',
      slideCount: 10,
      slides: [
        {
          id: 1,
          heading: "Customer Service Excellence",
          content: "Delivering exceptional customer experiences.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop",
          hasVideo: true,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        },
        {
          id: 2,
          heading: "Handling Difficult Customers",
          content: "Professional techniques for challenging situations.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop",
          hasVideo: false,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        }
      ]
    },
    {
      id: 'biz-sales',
      title: 'Sales Training',
      subtitle: 'Advanced sales techniques',
      slideCount: 7,
      slides: [
        {
          id: 1,
          heading: "Sales Fundamentals",
          content: "Core principles of effective selling.",
          type: "content",
          backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop",
          hasVideo: true,
          videoProgress: 0,
          videoUrl: null,
          runwayTaskId: null,
          videoStatus: "idle"
        }
      ]
    }
  ]
};

// Current state
let currentDeck = null;
let currentSlideIndex = 0;
let isPlaying = false;

// Prevent double-starting the same slide generation
const runwayInflight = new Set();

// --------------------------
// RUNWAY HELPERS (Netlify)
// --------------------------

function buildRunwayPromptFromSlide(slide, deck) {
  // You can tune this prompt format any time. This is a good baseline for "scene video".
  // Keep it explicit: style, environment, camera motion, subject, mood.
  const style = slide.type === "content" ? "clean training video, clear lighting, simple composition" : "training video";
  const camera = "slow cinematic camera pan, steady motion, no shaky cam";
  const environment = deck?.title ? `${deck.title} training environment` : "training environment";
  const topic = slide.heading || "training topic";

  // You can also incorporate slide.scene if you use it
  const scene = slide.scene ? `Scene details: ${slide.scene}.` : "";

  return `${style}. ${camera}. ${environment}. Topic: ${topic}. ${slide.content || ""} ${scene}`.trim();
}

async function createRunwayVideo({ prompt, duration = 5, aspectRatio = "16:9", model = "gen4.5" }) {
  const res = await fetch("/.netlify/functions/generate-runway-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, duration, aspectRatio, model })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw data;
  }
  if (!data.id) {
    throw { error: "Runway create returned no id", raw: data };
  }
  return data; // { id, status, raw }
}

async function getRunwayTask(taskId) {
  const res = await fetch(`/.netlify/functions/get-runway-task?id=${encodeURIComponent(taskId)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data; // { status, videoUrl, raw }
}

function statusToProgress(status) {
  // Gentle progress mapping so your UI feels alive.
  // Runway statuses vary; we handle common ones and fall back.
  const s = String(status || "").toUpperCase();
  if (s.includes("PENDING")) return 10;
  if (s.includes("QUEUED")) return 15;
  if (s.includes("RUNNING")) return 55;
  if (s.includes("PROCESSING")) return 55;
  if (s.includes("SUCCEEDED")) return 100;
  if (s.includes("FAILED") || s.includes("CANCELED") || s.includes("ERROR")) return 0;
  return 25;
}

async function generateRunwayForSlide(slideIndex, opts = {}) {
  if (!currentDeck) return;
  const slide = currentDeck.slides[slideIndex];
  if (!slide || !slide.hasVideo) return;

  // Already generated?
  if (slide.videoUrl) {
    showSlideFullscreen(slide);
    return;
  }

  // Avoid double-generating
  const key = `${currentDeck.id}:${slide.id}`;
  if (runwayInflight.has(key)) return;
  runwayInflight.add(key);

  try {
    slide.videoProgress = Math.max(slide.videoProgress || 0, 5);
    slide.videoStatus = "starting";
    renderSlideStack();

    const prompt = opts.prompt || buildRunwayPromptFromSlide(slide, currentDeck);
    const duration = opts.duration ?? 5;
    const aspectRatio = opts.aspectRatio ?? "16:9";
    const model = opts.model ?? "gen4.5";

    const created = await createRunwayVideo({ prompt, duration, aspectRatio, model });
    slide.runwayTaskId = created.id;
    slide.videoStatus = created.status || "PENDING";
    slide.videoProgress = Math.max(slide.videoProgress, statusToProgress(slide.videoStatus));
    renderSlideStack();

    // Poll until done
    const start = Date.now();
    const timeoutMs = 240000; // 4 min
    while (Date.now() - start < timeoutMs) {
      const task = await getRunwayTask(slide.runwayTaskId);
      slide.videoStatus = task.status || "UNKNOWN";
      slide.videoProgress = Math.max(slide.videoProgress, statusToProgress(slide.videoStatus));
      renderSlideStack();

      if (slide.videoStatus === "SUCCEEDED" && task.videoUrl) {
        slide.videoUrl = task.videoUrl;
        slide.videoProgress = 100;
        renderSlideStack();
        showSlideFullscreen(slide);
        return;
      }

      if (slide.videoStatus === "FAILED" || slide.videoStatus === "CANCELED") {
        throw task;
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    throw { error: "Runway timeout", id: slide.runwayTaskId };
  } catch (e) {
    console.error("Runway generation error:", e);
    slide.videoStatus = "error";
    slide.videoProgress = 0;
    renderSlideStack();
    alert(`❌ Runway video failed for: ${slide.heading}\n\nCheck console for details.`);
  } finally {
    runwayInflight.delete(key);
  }
}

// --------------------------
// UI / Deck Navigation
// --------------------------

// Open a specific deck - MAIN FUNCTIONALITY
function openDeck(category, deckIndex) {
  const deck = courseDecks[category][deckIndex];
  if (!deck) return;

  currentDeck = deck;
  currentSlideIndex = 0;

  console.log(`Opening deck: ${deck.title}`);

  // Update deck info (guard — elements may not exist in all layouts)
  const deckTitleEl = document.getElementById('deckTitle');
  const deckSubtitleEl = document.getElementById('deckSubtitle');
  if (deckTitleEl) deckTitleEl.textContent = deck.title;
  if (deckSubtitleEl) deckSubtitleEl.textContent = deck.subtitle;

  // Show full deck view
  const overviewMode = document.getElementById('overviewMode');
  const fullDeckView = document.getElementById('fullDeckView');
  if (overviewMode) overviewMode.style.display = 'none';
  if (fullDeckView) fullDeckView.classList.add('active');

  // Render the slide stack
  renderSlideStack();
  updateControls();
}

// Close deck and return to overview - BACK BUTTON
function closeDeck() {
  console.log('Closing deck, returning to overview');

  document.getElementById('overviewMode').style.display = 'block';
  document.getElementById('fullDeckView').classList.remove('active');
  currentDeck = null;
  currentSlideIndex = 0;
}

// Render the stacked slide deck
function renderSlideStack() {
  if (!currentDeck) return;

  const container = document.getElementById('slideDeckContainer');
  const slides = currentDeck.slides;

  container.innerHTML = slides.map((slide, index) => {
    const position = index - currentSlideIndex;
    const isVisible = position >= 0 && position < 6; // Show 6 slides max

    if (!isVisible) return '';

    const showProgress = slide.hasVideo && (slide.videoProgress > 0 || slide.videoStatus === "starting" || slide.videoStatus === "PENDING" || slide.videoStatus === "RUNNING");
    const progressIsActive = slide.videoProgress < 100 && slide.videoStatus !== "error" && slide.videoStatus !== "idle";

    return `
      <div class="slide-deck" data-position="${position}" onclick="selectSlide(${index})">
        <div class="slide-content">
          ${slide.backgroundImage ? `<div class="slide-background" style="background-image: url('${slide.backgroundImage}');"></div>` : ''}
          <div class="slide-overlay"></div>

          <div class="slide-header">
            <div class="slide-number">Slide ${slide.id}</div>
            <h3 class="slide-title">${slide.heading}</h3>
          </div>

          <div class="slide-body">
            <div class="slide-content-text">${slide.content}</div>
          </div>

          <div class="slide-footer">
            <button class="play-slide-btn" onclick="event.stopPropagation(); playSlide(${index})">
              <i class="fas fa-play"></i>
              Play Slide
            </button>

            <div class="slide-badges">
              ${slide.hasVideo ? `<div class="slide-badge video-badge"><i class="fas fa-video mr-1"></i> Video</div>` : ''}
              ${slide.scene ? `<div class="slide-badge scene-badge"><i class="fas fa-image mr-1"></i> Scene</div>` : ''}
              ${slide.videoUrl ? `<div class="slide-badge video-badge"><i class="fas fa-check mr-1"></i> Ready</div>` : ''}
              ${slide.videoStatus === "error" ? `<div class="slide-badge video-badge"><i class="fas fa-triangle-exclamation mr-1"></i> Failed</div>` : ''}
            </div>
          </div>

          ${showProgress ? `
            <div class="video-progress ${progressIsActive ? 'active' : ''}">
              <div class="video-progress-bar" style="width: ${Math.min(100, Math.max(0, slide.videoProgress || 0))}%"></div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Navigation functions
function nextSlide() {
  if (!currentDeck || currentSlideIndex >= currentDeck.slides.length - 1) return;
  currentSlideIndex++;
  renderSlideStack();
  updateControls();
}

function previousSlide() {
  if (!currentDeck || currentSlideIndex <= 0) return;
  currentSlideIndex--;
  renderSlideStack();
  updateControls();
}

function selectSlide(index) {
  currentSlideIndex = index;
  renderSlideStack();
  updateControls();
}

function updateControls() {
  if (!currentDeck) return;

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (prevBtn) prevBtn.disabled = currentSlideIndex === 0;
  if (nextBtn) nextBtn.disabled = currentSlideIndex === currentDeck.slides.length - 1;
}

// Play functions
function playSlide(index) {
  if (!currentDeck) return;

  const slide = currentDeck.slides[index];
  console.log(`Playing slide ${index + 1}: ${slide.heading}`);

  // If slide has video:
  // - If already generated => play fullscreen
  // - Else generate via Runway and show progress
  if (slide.hasVideo) {
    if (slide.videoUrl) {
      showSlideFullscreen(slide);
    } else {
      // Kick off Runway generation (REAL)
      generateRunwayForSlide(index);
    }
  } else {
    showSlideFullscreen(slide);
  }
}

function playAllSlides() {
  if (!currentDeck) return;

  if (isPlaying) {
    stopPlayAll();
    return;
  }

  isPlaying = true;
  const playBtn = document.getElementById('playAllBtn');
  if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause mr-2"></i> Pause Deck';

  // Auto-advance through slides
  const playInterval = setInterval(async () => {
    if (!isPlaying) {
      clearInterval(playInterval);
      return;
    }

    const slide = currentDeck.slides[currentSlideIndex];

    // If slide requires video and it's not ready yet, generate it and wait until it's ready/fails
    if (slide?.hasVideo && !slide.videoUrl && slide.videoStatus !== "error") {
      await generateRunwayForSlide(currentSlideIndex).catch(() => {});
    }

    if (currentSlideIndex < currentDeck.slides.length - 1) {
      nextSlide();
    } else {
      stopPlayAll();
      clearInterval(playInterval);
      alert(`🎓 ${currentDeck.title} completed!`);
    }
  }, 3000);
}

function stopPlayAll() {
  isPlaying = false;
  const playBtn = document.getElementById('playAllBtn');
  if (playBtn) playBtn.innerHTML = '<i class="fas fa-play mr-2"></i> Play Deck';
}

// Scene editing - EDIT SCENE BUTTON
function editCurrentScene() {
  if (!currentDeck) return;

  const slide = currentDeck.slides[currentSlideIndex];

  const sceneOptions = prompt(
    `🎨 Edit Scene for: ${slide.heading}\n\n` +
    `Current background: ${slide.backgroundImage ? 'Custom image' : 'Default'}\n\n` +
    `Options:\n` +
    `1. Change background image\n` +
    `2. Edit scene description\n` +
    `3. Modify lighting\n\n` +
    `Enter option number (1-3):`
  );

  if (sceneOptions === '1') {
    const newBg = prompt('Enter new background image URL:', slide.backgroundImage);
    if (newBg) {
      slide.backgroundImage = newBg;
      renderSlideStack();
      alert('✅ Background updated!');
    }
  } else if (sceneOptions === '2') {
    const newScene = prompt('Enter scene description:', slide.scene || 'Professional training environment');
    if (newScene) {
      slide.scene = newScene;
      alert('✅ Scene description updated!');
    }
  } else if (sceneOptions === '3') {
    alert('🎨 Lighting controls would open here\n\nAdjust brightness, contrast, and color temperature');
  }
}

// Fullscreen slide display (supports video if present)
function showSlideFullscreen(slide) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center';

  const hasVideo = !!slide.videoUrl;

  overlay.innerHTML = `
    <div class="max-w-5xl w-full mx-8 text-center relative">
      <button onclick="this.parentElement.parentElement.remove()"
              class="absolute top-6 right-6 bg-red-600 hover:bg-red-700 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl transition-colors">
        ✕
      </button>

      <div class="relative">
        ${hasVideo ? `
          <video src="${slide.videoUrl}" controls autoplay class="w-full max-h-[70vh] rounded-xl mb-6"></video>
        ` : (slide.backgroundImage ? `
          <img src="${slide.backgroundImage}" class="w-full h-64 object-cover rounded-xl mb-8">
        ` : '')}

        <h1 class="text-4xl font-bold text-white mb-6">${slide.heading}</h1>
        <div class="text-xl text-white/90 leading-relaxed">${slide.content}</div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

// Course generation
function generateNewCourse() {
  const topic = prompt("Enter course topic:", "New Training Course");
  if (!topic) return;

  const category = prompt("Select category:\n1. Safety\n2. Technical\n3. Business\n\nEnter number (1-3):");

  let categoryKey = 'business';
  if (category === '1') categoryKey = 'safety';
  else if (category === '2') categoryKey = 'technical';

  const newDeck = {
    id: 'new-' + Date.now(),
    title: topic,
    subtitle: 'AI-generated course',
    slideCount: 5,
    slides: [
      {
        id: 1,
        heading: `Introduction to ${topic}`,
        content: `Welcome to this comprehensive ${topic} training course.`,
        type: 'content',
        backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop',
        hasVideo: true,
        videoProgress: 0,
        videoUrl: null,
        runwayTaskId: null,
        videoStatus: "idle"
      },
      {
        id: 2,
        heading: `${topic} Fundamentals`,
        content: `Core concepts and principles you need to understand.`,
        type: 'content',
        backgroundImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop',
        hasVideo: false,
        videoProgress: 0,
        videoUrl: null,
        runwayTaskId: null,
        videoStatus: "idle"
      }
    ]
  };

  courseDecks[categoryKey] = courseDecks[categoryKey] || [];
  courseDecks[categoryKey].push(newDeck);

  alert(`✅ Created new course: ${topic}\n\nCategory: ${categoryKey.toUpperCase()}\n\nRefreshing page to show new deck...`);
  location.reload();
}

// Upload placeholder
function showUploadDialog() {
  alert('📁 File Upload Feature\n\nThis would open a dialog to:\n• Upload PDF, PowerPoint, Word docs\n• Convert to course decks\n• Add to deck rows\n\n(Feature ready for implementation)');
}

// Initialize the interface
function init() {
  console.log('Initializing Course Studio - Deck Rows Interface');

  const overviewMode = document.getElementById('overviewMode');
  const fullDeckView = document.getElementById('fullDeckView');

  if (overviewMode) {
    overviewMode.style.display = 'block';
    console.log('✅ Overview mode active');
  }

  if (fullDeckView) {
    fullDeckView.classList.remove('active');
    console.log('✅ Full deck view hidden');
  }

  console.log(`📚 Loaded ${Object.keys(courseDecks).length} course categories`);
  console.log(`🎯 Ready for deck interaction`);
}

document.addEventListener('DOMContentLoaded', init);