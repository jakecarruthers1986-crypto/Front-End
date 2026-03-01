// Course Studio - Deck Rows Interface
// Based on your supplied files - building on what you have

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
                    videoProgress: 0
                },
                {
                    id: 2,
                    heading: "Personal Protective Equipment", 
                    content: "Understanding the importance of PPE and proper usage guidelines.",
                    type: "content",
                    backgroundImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop",
                    hasVideo: true,
                    videoProgress: 0
                },
                {
                    id: 3,
                    heading: "Hazard Identification",
                    content: "Recognize potential workplace hazards and implement safety protocols.",
                    type: "content",
                    backgroundImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800&fit=crop",
                    hasVideo: false,
                    videoProgress: 0
                },
                {
                    id: 4,
                    heading: "Emergency Procedures",
                    content: "Step-by-step emergency response protocols for various workplace situations.",
                    type: "content",
                    backgroundImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop",
                    hasVideo: true,
                    videoProgress: 0
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
                    videoProgress: 0
                },
                {
                    id: 2,
                    heading: "PPE Selection",
                    content: "Choosing the right protective equipment for your job.",
                    type: "content",
                    backgroundImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800&fit=crop",
                    hasVideo: false,
                    videoProgress: 0
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
                    videoProgress: 0
                },
                {
                    id: 2,
                    heading: "Advanced Features",
                    content: "Master advanced functionality and workflows.",
                    type: "content",
                    backgroundImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop",
                    hasVideo: true,
                    videoProgress: 0
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
                    videoProgress: 0
                },
                {
                    id: 2,
                    heading: "Handling Difficult Customers",
                    content: "Professional techniques for challenging situations.",
                    type: "content",
                    backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop",
                    hasVideo: false,
                    videoProgress: 0
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
                    videoProgress: 0
                }
            ]
        }
    ]
};

// Current state
let currentDeck = null;
let currentSlideIndex = 0;
let isPlaying = false;

// Open a specific deck - MAIN FUNCTIONALITY
function openDeck(category, deckIndex) {
    const deck = courseDecks[category][deckIndex];
    if (!deck) return;
    
    currentDeck = deck;
    currentSlideIndex = 0;
    
    console.log(`Opening deck: ${deck.title}`);
    
    // Update deck info
    document.getElementById('deckTitle').textContent = deck.title;
    document.getElementById('deckSubtitle').textContent = deck.subtitle;
    
    // Show full deck view
    document.getElementById('overviewMode').style.display = 'none';
    document.getElementById('fullDeckView').classList.add('active');
    
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
                            ${slide.hasVideo ? '<div class="slide-badge video-badge"><i class="fas fa-video mr-1"></i> Video</div>' : ''}
                            ${slide.scene ? '<div class="slide-badge scene-badge"><i class="fas fa-image mr-1"></i> Scene</div>' : ''}
                        </div>
                    </div>
                    
                    ${slide.hasVideo && slide.videoProgress > 0 ? `
                        <div class="video-progress ${slide.videoProgress < 100 ? 'active' : ''}">
                            <div class="video-progress-bar" style="width: ${slide.videoProgress}%"></div>
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

// Play functions with progress bar
function playSlide(index) {
    if (!currentDeck) return;
    
    const slide = currentDeck.slides[index];
    console.log(`Playing slide ${index + 1}: ${slide.heading}`);
    
    // If slide has video, show video generation progress
    if (slide.hasVideo) {
        simulateVideoGeneration(index);
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
    const playInterval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(playInterval);
            return;
        }
        
        if (currentSlideIndex < currentDeck.slides.length - 1) {
            nextSlide();
        } else {
            // Deck finished
            stopPlayAll();
            clearInterval(playInterval);
            alert(`🎓 ${currentDeck.title} completed!`);
        }
    }, 3000); // 3 seconds per slide
}

function stopPlayAll() {
    isPlaying = false;
    const playBtn = document.getElementById('playAllBtn');
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-play mr-2"></i> Play Deck';
}

// Video generation with progress bar
function simulateVideoGeneration(slideIndex) {
    if (!currentDeck) return;
    
    const slide = currentDeck.slides[slideIndex];
    slide.videoProgress = 0;
    
    alert(`🎬 Starting video generation for: ${slide.heading}\n\nWatch the progress bar!`);
    
    const progressInterval = setInterval(() => {
        slide.videoProgress += Math.random() * 15; // Variable progress
        renderSlideStack();
        
        if (slide.videoProgress >= 100) {
            slide.videoProgress = 100;
            clearInterval(progressInterval);
            renderSlideStack();
            
            setTimeout(() => {
                alert(`✅ Video ready for: ${slide.heading}\n\nVideo generation complete!`);
            }, 500);
        }
    }, 300);
}

// Scene editing - EDIT SCENE BUTTON
function editCurrentScene() {
    if (!currentDeck) return;
    
    const slide = currentDeck.slides[currentSlideIndex];
    
    // Show scene editing options
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

// Fullscreen slide display
function showSlideFullscreen(slide) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center';
    overlay.innerHTML = `
        <div class="max-w-4xl w-full mx-8 text-center">
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="absolute top-8 right-8 bg-red-600 hover:bg-red-700 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl transition-colors">
                ✕
            </button>
            <div class="relative">
                ${slide.backgroundImage ? `<img src="${slide.backgroundImage}" class="w-full h-64 object-cover rounded-xl mb-8">` : ''}
                <h1 class="text-5xl font-bold text-white mb-8">${slide.heading}</h1>
                <div class="text-2xl text-white/90 leading-relaxed">${slide.content}</div>
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
    
    // Create new deck
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
                videoProgress: 0
            },
            {
                id: 2,
                heading: `${topic} Fundamentals`,
                content: `Core concepts and principles you need to understand.`,
                type: 'content',
                backgroundImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop',
                hasVideo: false,
                videoProgress: 0
            }
        ]
    };
    
    courseDecks[categoryKey] = courseDecks[categoryKey] || [];
    courseDecks[categoryKey].push(newDeck);
    
    alert(`✅ Created new course: ${topic}\n\nCategory: ${categoryKey.toUpperCase()}\n\nRefreshing page to show new deck...`);
    location.reload(); // Refresh to show new deck
}

// Upload placeholder
function showUploadDialog() {
    alert('📁 File Upload Feature\n\nThis would open a dialog to:\n• Upload PDF, PowerPoint, Word docs\n• Convert to course decks\n• Add to deck rows\n\n(Feature ready for implementation)');
}

// Initialize the interface
function init() {
    console.log('Initializing Course Studio - Deck Rows Interface');
    
    // Start in overview mode
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);
