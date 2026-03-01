// Interactive Assessment System
// Handles all pop-up quizzes, hotspots, drag-drop, scenario decisions

const AssessmentEngine = {
    activeAssessment: null,
    assessmentHistory: [],
    userResponses: [],
    
    // Assessment types registry
    types: {
        multipleChoice: 'multiple-choice',
        trueFalse: 'true-false',
        dragDrop: 'drag-drop',
        hotspot: 'hotspot',
        fillBlank: 'fill-blank',
        scenario: 'scenario',
        timed: 'timed'
    },
    
    // Initialize assessment on slide
    trigger(assessment, slideIndex, timestamp = 0) {
        this.activeAssessment = {
            ...assessment,
            slideIndex,
            timestamp,
            startTime: Date.now(),
            attempts: 0
        };
        
        this.render();
    },
    
    // Render assessment overlay
    render() {
        const assessment = this.activeAssessment;
        if (!assessment) return;
        
        const overlay = this.createOverlay();
        const content = this.createContent(assessment);
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        // Pause any playing audio/video
        this.pauseMedia();
        
        // Track analytics
        this.trackEvent('assessment_started', assessment);
    },
    
    // Create overlay backdrop
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'assessment-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn';
        overlay.style.backdropFilter = 'blur(4px)';
        return overlay;
    },
    
    // Create assessment content based on type
    createContent(assessment) {
        const container = document.createElement('div');
        container.className = 'bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden';
        
        const header = this.createHeader(assessment);
        const body = this.createBody(assessment);
        const footer = this.createFooter(assessment);
        
        container.appendChild(header);
        container.appendChild(body);
        container.appendChild(footer);
        
        return container;
    },
    
    // Assessment header
    createHeader(assessment) {
        const header = document.createElement('div');
        header.className = 'bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6';
        
        const icon = this.getIcon(assessment.type);
        const title = assessment.title || 'Knowledge Check';
        
        header.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${icon}</span>
                    <h3 class="text-xl font-bold">${title}</h3>
                </div>
                ${assessment.timed ? `
                    <div class="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                        <span class="text-2xl">⏱️</span>
                        <span class="text-lg font-mono" id="timer">--:--</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        if (assessment.timed) {
            this.startTimer(assessment.timeLimit || 30);
        }
        
        return header;
    },
    
    // Assessment body based on type
    createBody(assessment) {
        const body = document.createElement('div');
        body.className = 'p-8';
        body.id = 'assessment-body';
        
        switch(assessment.type) {
            case this.types.multipleChoice:
                body.innerHTML = this.renderMultipleChoice(assessment);
                break;
            case this.types.trueFalse:
                body.innerHTML = this.renderTrueFalse(assessment);
                break;
            case this.types.dragDrop:
                body.innerHTML = this.renderDragDrop(assessment);
                break;
            case this.types.hotspot:
                body.innerHTML = this.renderHotspot(assessment);
                break;
            case this.types.fillBlank:
                body.innerHTML = this.renderFillBlank(assessment);
                break;
            case this.types.scenario:
                body.innerHTML = this.renderScenario(assessment);
                break;
        }
        
        return body;
    },
    
    // Multiple Choice rendering
    renderMultipleChoice(assessment) {
        return `
            <div class="space-y-6">
                <p class="text-xl font-semibold text-gray-800 leading-relaxed">
                    ${assessment.question}
                </p>
                <div class="space-y-3">
                    ${assessment.options.map((option, idx) => `
                        <div class="assessment-option group cursor-pointer border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition-all"
                             onclick="AssessmentEngine.selectOption(${idx})"
                             data-option="${idx}">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                                    ${String.fromCharCode(65 + idx)}
                                </div>
                                <div class="flex-1 text-lg text-gray-700">
                                    ${option.text}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div id="feedback" class="hidden mt-6 p-4 rounded-xl"></div>
            </div>
        `;
    },
    
    // True/False rendering
    renderTrueFalse(assessment) {
        return `
            <div class="space-y-6">
                <p class="text-xl font-semibold text-gray-800 leading-relaxed">
                    ${assessment.question}
                </p>
                <div class="grid grid-cols-2 gap-4">
                    <div class="assessment-option cursor-pointer border-4 border-green-500 rounded-xl p-8 hover:bg-green-50 text-center transition-all"
                         onclick="AssessmentEngine.selectTrueFalse(true)">
                        <div class="text-6xl mb-2">✓</div>
                        <div class="text-2xl font-bold text-green-700">TRUE</div>
                    </div>
                    <div class="assessment-option cursor-pointer border-4 border-red-500 rounded-xl p-8 hover:bg-red-50 text-center transition-all"
                         onclick="AssessmentEngine.selectTrueFalse(false)">
                        <div class="text-6xl mb-2">✗</div>
                        <div class="text-2xl font-bold text-red-700">FALSE</div>
                    </div>
                </div>
                <div id="feedback" class="hidden mt-6 p-4 rounded-xl"></div>
            </div>
        `;
    },
    
    // Drag and Drop rendering
    renderDragDrop(assessment) {
        return `
            <div class="space-y-6">
                <p class="text-lg font-semibold text-gray-800 mb-4">
                    ${assessment.instructions || 'Drag items to the correct locations'}
                </p>
                
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-bold mb-3 text-gray-700">Items to Drag:</h4>
                        <div id="drag-source" class="space-y-2 min-h-[200px] bg-gray-50 p-4 rounded-xl">
                            ${assessment.items.map((item, idx) => `
                                <div class="draggable bg-white border-2 border-gray-300 rounded-lg p-3 cursor-move hover:shadow-lg transition-all"
                                     draggable="true"
                                     data-item-id="${idx}"
                                     ondragstart="AssessmentEngine.dragStart(event)">
                                    <span class="font-medium">${item.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-bold mb-3 text-gray-700">Drop Zones:</h4>
                        <div class="space-y-2">
                            ${assessment.targets.map((target, idx) => `
                                <div class="drop-zone min-h-[60px] border-2 border-dashed border-blue-400 rounded-lg p-3 bg-blue-50"
                                     data-target-id="${idx}"
                                     ondragover="AssessmentEngine.dragOver(event)"
                                     ondrop="AssessmentEngine.drop(event)">
                                    <div class="text-sm font-semibold text-blue-700 mb-2">${target.label}</div>
                                    <div class="drop-content"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div id="feedback" class="hidden mt-6 p-4 rounded-xl"></div>
            </div>
        `;
    },
    
    // Hotspot rendering
    renderHotspot(assessment) {
        return `
            <div class="space-y-4">
                <p class="text-lg font-semibold text-gray-800">
                    ${assessment.instructions || 'Click on the correct areas'}
                </p>
                <div class="relative inline-block">
                    <img src="${assessment.image}" alt="Hotspot image" class="rounded-xl shadow-lg max-w-full">
                    ${assessment.hotspots.map((spot, idx) => `
                        <div class="absolute cursor-pointer hotspot-area"
                             style="left: ${spot.x}%; top: ${spot.y}%; width: ${spot.width}%; height: ${spot.height}%;"
                             onclick="AssessmentEngine.clickHotspot(${idx})"
                             data-hotspot="${idx}">
                        </div>
                    `).join('')}
                    <div id="hotspot-markers"></div>
                </div>
                <div class="flex gap-2 items-center">
                    <span class="font-semibold">Found:</span>
                    <span id="hotspot-count" class="text-blue-600 font-bold">0 / ${assessment.hotspots.length}</span>
                </div>
                <div id="feedback" class="hidden mt-4 p-4 rounded-xl"></div>
            </div>
        `;
    },
    
    // Fill in the blank rendering
    renderFillBlank(assessment) {
        const parts = assessment.text.split('___');
        return `
            <div class="space-y-6">
                <p class="text-lg font-semibold text-gray-800 mb-4">
                    Complete the sentence:
                </p>
                <div class="text-xl leading-relaxed bg-gray-50 p-6 rounded-xl">
                    ${parts.map((part, idx) => `
                        <span>${part}</span>
                        ${idx < parts.length - 1 ? `
                            <input type="text" 
                                   class="inline-block border-b-4 border-blue-600 bg-transparent px-2 py-1 text-center font-semibold focus:outline-none focus:bg-blue-50"
                                   data-blank-index="${idx}"
                                   placeholder="___"
                                   style="width: 150px;">
                        ` : ''}
                    `).join('')}
                </div>
                <div id="feedback" class="hidden mt-6 p-4 rounded-xl"></div>
            </div>
        `;
    },
    
    // Scenario rendering
    renderScenario(assessment) {
        return `
            <div class="space-y-6">
                <div class="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-l-4 border-orange-500">
                    <div class="flex items-start gap-4">
                        <span class="text-4xl">⚠️</span>
                        <div>
                            <h4 class="font-bold text-lg text-orange-900 mb-2">Scenario</h4>
                            <p class="text-gray-800 leading-relaxed">${assessment.scenario}</p>
                        </div>
                    </div>
                </div>
                
                <p class="text-lg font-semibold text-gray-800">What do you do?</p>
                
                <div class="space-y-3">
                    ${assessment.choices.map((choice, idx) => `
                        <div class="assessment-option group cursor-pointer border-2 border-gray-200 rounded-xl p-4 hover:border-orange-500 hover:bg-orange-50 transition-all"
                             onclick="AssessmentEngine.selectScenario(${idx})"
                             data-choice="${idx}">
                            <div class="flex items-start gap-4">
                                <div class="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                                    ${String.fromCharCode(65 + idx)}
                                </div>
                                <div class="flex-1 text-gray-700">
                                    ${choice.text}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div id="feedback" class="hidden mt-6 p-4 rounded-xl"></div>
            </div>
        `;
    },
    
    // Footer with actions
    createFooter(assessment) {
        const footer = document.createElement('div');
        footer.className = 'bg-gray-50 p-6 flex justify-between items-center border-t';
        footer.id = 'assessment-footer';
        
        footer.innerHTML = `
            <div class="text-sm text-gray-600">
                ${assessment.canSkip ? '<button onclick="AssessmentEngine.skip()" class="text-blue-600 hover:underline">Skip →</button>' : ''}
            </div>
            <div class="flex gap-3">
                ${assessment.allowRetry && this.activeAssessment.attempts > 0 ? 
                    '<button onclick="AssessmentEngine.retry()" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Try Again</button>' : ''}
                <button id="submit-btn" onclick="AssessmentEngine.submit()" class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                    Check Answer
                </button>
            </div>
        `;
        
        return footer;
    },
    
    // Get icon for assessment type
    getIcon(type) {
        const icons = {
            'multiple-choice': '❓',
            'true-false': '⚖️',
            'drag-drop': '🎯',
            'hotspot': '🔍',
            'fill-blank': '✍️',
            'scenario': '🎭',
            'timed': '⏱️'
        };
        return icons[type] || '📝';
    },
    
    // Timer functionality
    startTimer(seconds) {
        let remaining = seconds;
        const timerEl = document.getElementById('timer');
        
        const interval = setInterval(() => {
            remaining--;
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            
            if (remaining <= 10) {
                timerEl.parentElement.classList.add('animate-pulse', 'bg-red-500');
            }
            
            if (remaining <= 0) {
                clearInterval(interval);
                this.timeUp();
            }
        }, 1000);
        
        this.activeAssessment.timerInterval = interval;
    },
    
    timeUp() {
        this.showFeedback(false, 'Time\'s up! The correct answer has been revealed.');
        document.getElementById('submit-btn').disabled = true;
    },
    
    // Selection handlers
    selectOption(index) {
        // Remove previous selections
        document.querySelectorAll('.assessment-option').forEach(opt => {
            opt.classList.remove('border-blue-600', 'bg-blue-100');
        });
        
        // Mark selected
        const selected = document.querySelector(`[data-option="${index}"]`);
        selected.classList.add('border-blue-600', 'bg-blue-100');
        
        this.activeAssessment.selectedAnswer = index;
    },
    
    selectTrueFalse(answer) {
        this.activeAssessment.selectedAnswer = answer;
        this.submit();
    },
    
    selectScenario(index) {
        // Remove previous selections
        document.querySelectorAll('[data-choice]').forEach(opt => {
            opt.classList.remove('border-orange-600', 'bg-orange-100');
        });
        
        // Mark selected
        const selected = document.querySelector(`[data-choice="${index}"]`);
        selected.classList.add('border-orange-600', 'bg-orange-100');
        
        this.activeAssessment.selectedAnswer = index;
    },
    
    // Drag and drop handlers
    dragStart(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
        e.dataTransfer.setData('itemId', e.target.dataset.itemId);
        e.target.style.opacity = '0.4';
    },
    
    dragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    },
    
    drop(e) {
        if (e.stopPropagation) e.stopPropagation();
        e.preventDefault();
        
        const itemId = e.dataTransfer.getData('itemId');
        const itemHtml = e.dataTransfer.getData('text/html');
        
        const dropZone = e.target.closest('.drop-zone');
        const content = dropZone.querySelector('.drop-content');
        content.innerHTML = `<div class="bg-white border-2 border-blue-500 rounded-lg p-2">${itemHtml}</div>`;
        content.dataset.itemId = itemId;
        
        // Remove from source
        document.querySelector(`[data-item-id="${itemId}"]`).remove();
        
        return false;
    },
    
    // Hotspot click handler
    clickHotspot(index) {
        const assessment = this.activeAssessment;
        if (!assessment.foundHotspots) assessment.foundHotspots = [];
        
        if (!assessment.foundHotspots.includes(index)) {
            assessment.foundHotspots.push(index);
            
            // Mark as found
            const marker = document.createElement('div');
            marker.className = 'absolute w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold animate-ping';
            marker.style.left = assessment.hotspots[index].x + '%';
            marker.style.top = assessment.hotspots[index].y + '%';
            marker.innerHTML = '✓';
            document.getElementById('hotspot-markers').appendChild(marker);
            
            setTimeout(() => marker.classList.remove('animate-ping'), 1000);
            
            // Update count
            document.getElementById('hotspot-count').textContent = 
                `${assessment.foundHotspots.length} / ${assessment.hotspots.length}`;
            
            // Auto-submit when all found
            if (assessment.foundHotspots.length === assessment.hotspots.length) {
                setTimeout(() => this.submit(), 500);
            }
        }
    },
    
    // Submit assessment
    submit() {
        const assessment = this.activeAssessment;
        if (!assessment) return;
        
        assessment.attempts++;
        
        let isCorrect = false;
        let feedback = '';
        
        switch(assessment.type) {
            case this.types.multipleChoice:
                isCorrect = assessment.selectedAnswer === assessment.correctAnswer;
                feedback = isCorrect ? assessment.correctFeedback : assessment.incorrectFeedback;
                break;
                
            case this.types.trueFalse:
                isCorrect = assessment.selectedAnswer === assessment.correctAnswer;
                feedback = isCorrect ? assessment.correctFeedback : assessment.incorrectFeedback;
                break;
                
            case this.types.dragDrop:
                isCorrect = this.checkDragDropAnswers(assessment);
                feedback = isCorrect ? 'Perfect! All items matched correctly.' : 'Not quite right. Try again.';
                break;
                
            case this.types.hotspot:
                isCorrect = assessment.foundHotspots && assessment.foundHotspots.length === assessment.hotspots.length;
                feedback = isCorrect ? 'Excellent! You found all the hotspots.' : 'Keep looking...';
                break;
                
            case this.types.fillBlank:
                isCorrect = this.checkFillBlankAnswers(assessment);
                feedback = isCorrect ? 'Correct!' : 'Not quite. Check your answers.';
                break;
                
            case this.types.scenario:
                const choice = assessment.choices[assessment.selectedAnswer];
                isCorrect = choice.isCorrect;
                feedback = choice.feedback;
                break;
        }
        
        this.showFeedback(isCorrect, feedback);
        this.saveResponse(assessment, isCorrect);
        
        // Clear timer if exists
        if (assessment.timerInterval) {
            clearInterval(assessment.timerInterval);
        }
    },
    
    checkDragDropAnswers(assessment) {
        const dropZones = document.querySelectorAll('.drop-zone');
        let allCorrect = true;
        
        dropZones.forEach((zone, idx) => {
            const content = zone.querySelector('.drop-content');
            const itemId = content.dataset.itemId;
            if (itemId != assessment.targets[idx].correctItemId) {
                allCorrect = false;
            }
        });
        
        return allCorrect;
    },
    
    checkFillBlankAnswers(assessment) {
        const inputs = document.querySelectorAll('[data-blank-index]');
        let allCorrect = true;
        
        inputs.forEach((input, idx) => {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = assessment.answers[idx].toLowerCase();
            if (userAnswer !== correctAnswer) {
                allCorrect = false;
            }
        });
        
        return allCorrect;
    },
    
    showFeedback(isCorrect, message) {
        const feedback = document.getElementById('feedback');
        feedback.className = `mt-6 p-4 rounded-xl ${isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`;
        feedback.innerHTML = `
            <div class="flex items-start gap-3">
                <span class="text-3xl">${isCorrect ? '✅' : '❌'}</span>
                <div>
                    <div class="font-bold text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}">
                        ${isCorrect ? 'Correct!' : 'Not quite...'}
                    </div>
                    <div class="${isCorrect ? 'text-green-700' : 'text-red-700'}">${message}</div>
                </div>
            </div>
        `;
        feedback.classList.remove('hidden');
        
        // Show continue button
        const footer = document.getElementById('assessment-footer');
        footer.innerHTML = `
            <div></div>
            <button onclick="AssessmentEngine.close()" class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                Continue →
            </button>
        `;
    },
    
    saveResponse(assessment, isCorrect) {
        this.userResponses.push({
            slideIndex: assessment.slideIndex,
            type: assessment.type,
            question: assessment.question || assessment.instructions,
            userAnswer: assessment.selectedAnswer,
            correct: isCorrect,
            attempts: assessment.attempts,
            timestamp: Date.now(),
            timeSpent: Date.now() - assessment.startTime
        });
        
        this.assessmentHistory.push({
            ...assessment,
            isCorrect,
            completedAt: Date.now()
        });
        
        // Save to localStorage
        localStorage.setItem('assessment_responses', JSON.stringify(this.userResponses));
    },
    
    skip() {
        this.close();
    },
    
    retry() {
        // Reset assessment state
        this.activeAssessment.selectedAnswer = null;
        this.activeAssessment.foundHotspots = [];
        
        // Re-render
        const overlay = document.getElementById('assessment-overlay');
        overlay.remove();
        this.render();
    },
    
    close() {
        const overlay = document.getElementById('assessment-overlay');
        if (overlay) overlay.remove();
        
        this.activeAssessment = null;
        
        // Resume media
        this.resumeMedia();
        
        // Trigger any callbacks
        if (window.onAssessmentComplete) {
            window.onAssessmentComplete();
        }
    },
    
    pauseMedia() {
        const audio = document.getElementById('audioPlayer');
        if (audio && !audio.paused) {
            audio.pause();
            this.wasPlaying = true;
        }
    },
    
    resumeMedia() {
        const audio = document.getElementById('audioPlayer');
        if (audio && this.wasPlaying) {
            audio.play();
            this.wasPlaying = false;
        }
    },
    
    // Analytics
    trackEvent(eventName, data) {
        console.log('Assessment Event:', eventName, data);
        // Could integrate with analytics service here
    },
    
    getAnalytics() {
        const total = this.userResponses.length;
        const correct = this.userResponses.filter(r => r.correct).length;
        const avgTime = this.userResponses.reduce((sum, r) => sum + r.timeSpent, 0) / total;
        
        return {
            total,
            correct,
            incorrect: total - correct,
            accuracy: (correct / total * 100).toFixed(1),
            averageTime: avgTime,
            responses: this.userResponses
        };
    },
    
    exportResults() {
        const analytics = this.getAnalytics();
        const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assessment-results-${Date.now()}.json`;
        a.click();
    }
};

// Make globally available
window.AssessmentEngine = AssessmentEngine;
