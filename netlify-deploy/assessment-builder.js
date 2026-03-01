// Assessment Builder UI Component
// Visual interface for creating assessments

const AssessmentBuilder = {
    currentSlideIndex: null,
    editingAssessment: null,
    
    // Open builder modal
    open(slideIndex = null, existingAssessment = null) {
        this.currentSlideIndex = slideIndex;
        this.editingAssessment = existingAssessment;
        
        const modal = this.createBuilderModal();
        document.body.appendChild(modal);
    },
    
    createBuilderModal() {
        const modal = document.createElement('div');
        modal.id = 'assessment-builder-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                <!-- Header -->
                <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold">📝 Create Interactive Assessment</h2>
                        <button onclick="AssessmentBuilder.close()" class="text-white hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <!-- Body -->
                <div class="flex-1 overflow-y-auto p-6">
                    <!-- Step 1: Type Selection -->
                    <div id="step-type" class="space-y-4">
                        <h3 class="text-lg font-bold text-gray-800">Step 1: Choose Assessment Type</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            ${this.renderTypeOptions()}
                        </div>
                    </div>
                    
                    <!-- Step 2: Configuration (hidden initially) -->
                    <div id="step-config" class="hidden space-y-6 mt-6">
                        <h3 class="text-lg font-bold text-gray-800">Step 2: Configure Assessment</h3>
                        <div id="config-content"></div>
                    </div>
                    
                    <!-- Step 3: Preview (hidden initially) -->
                    <div id="step-preview" class="hidden space-y-4 mt-6">
                        <h3 class="text-lg font-bold text-gray-800">Step 3: Preview</h3>
                        <div id="preview-content" class="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50"></div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="border-t p-6 bg-gray-50 flex justify-between">
                    <button onclick="AssessmentBuilder.close()" class="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                        Cancel
                    </button>
                    <div class="flex gap-3">
                        <button id="preview-btn" onclick="AssessmentBuilder.showPreview()" class="hidden px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Preview
                        </button>
                        <button id="save-btn" onclick="AssessmentBuilder.save()" class="hidden px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                            Add to Slide
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    },
    
    renderTypeOptions() {
        const types = [
            { id: 'multiple-choice', icon: '❓', name: 'Multiple Choice', desc: 'Select from options' },
            { id: 'true-false', icon: '⚖️', name: 'True/False', desc: 'Binary question' },
            { id: 'drag-drop', icon: '🎯', name: 'Drag & Drop', desc: 'Match items' },
            { id: 'hotspot', icon: '🔍', name: 'Hotspot Click', desc: 'Click correct areas' },
            { id: 'fill-blank', icon: '✍️', name: 'Fill in Blank', desc: 'Complete sentence' },
            { id: 'scenario', icon: '🎭', name: 'Scenario', desc: 'Decision making' }
        ];
        
        return types.map(type => `
            <div class="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
                 onclick="AssessmentBuilder.selectType('${type.id}')">
                <div class="text-4xl mb-2">${type.icon}</div>
                <div class="font-bold text-gray-800">${type.name}</div>
                <div class="text-xs text-gray-600 mt-1">${type.desc}</div>
            </div>
        `).join('');
    },
    
    selectType(type) {
        this.selectedType = type;
        document.getElementById('step-config').classList.remove('hidden');
        document.getElementById('preview-btn').classList.remove('hidden');
        
        const configContent = document.getElementById('config-content');
        configContent.innerHTML = this.getConfigForm(type);
    },
    
    getConfigForm(type) {
        const commonFields = `
            <div>
                <label class="block text-sm font-semibold mb-2">Title (optional)</label>
                <input type="text" id="assessment-title" class="w-full p-3 border rounded-lg" placeholder="Knowledge Check">
            </div>
            
            <div class="flex gap-4">
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="can-skip" class="rounded">
                    <label class="text-sm font-semibold">Allow skip</label>
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="allow-retry" class="rounded">
                    <label class="text-sm font-semibold">Allow retry</label>
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="is-timed" class="rounded">
                    <label class="text-sm font-semibold">Timed</label>
                </div>
            </div>
            
            <div id="timer-config" class="hidden">
                <label class="block text-sm font-semibold mb-2">Time Limit (seconds)</label>
                <input type="number" id="time-limit" class="w-full p-3 border rounded-lg" value="30" min="5" max="300">
            </div>
        `;
        
        let specificFields = '';
        
        switch(type) {
            case 'multiple-choice':
                specificFields = `
                    <div>
                        <label class="block text-sm font-semibold mb-2">Question *</label>
                        <textarea id="question" rows="3" class="w-full p-3 border rounded-lg" placeholder="What is the correct procedure?"></textarea>
                    </div>
                    
                    <div id="options-container">
                        <label class="block text-sm font-semibold mb-2">Answer Options *</label>
                        <div class="space-y-2" id="options-list">
                            ${[0,1,2,3].map(i => `
                                <div class="flex gap-2">
                                    <input type="radio" name="correct" value="${i}" ${i === 0 ? 'checked' : ''}>
                                    <input type="text" data-option="${i}" class="flex-1 p-2 border rounded" placeholder="Option ${String.fromCharCode(65 + i)}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Correct Feedback</label>
                        <input type="text" id="correct-feedback" class="w-full p-3 border rounded-lg" placeholder="That's correct!">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Incorrect Feedback</label>
                        <input type="text" id="incorrect-feedback" class="w-full p-3 border rounded-lg" placeholder="Not quite. Try again.">
                    </div>
                `;
                break;
                
            case 'true-false':
                specificFields = `
                    <div>
                        <label class="block text-sm font-semibold mb-2">Statement *</label>
                        <textarea id="question" rows="2" class="w-full p-3 border rounded-lg" placeholder="Safety equipment is optional in the warehouse."></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Correct Answer *</label>
                        <div class="flex gap-4">
                            <label class="flex items-center gap-2">
                                <input type="radio" name="tf-correct" value="true" checked>
                                <span class="font-semibold text-green-700">TRUE</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="radio" name="tf-correct" value="false">
                                <span class="font-semibold text-red-700">FALSE</span>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Explanation</label>
                        <textarea id="feedback" rows="2" class="w-full p-3 border rounded-lg" placeholder="Explain why..."></textarea>
                    </div>
                `;
                break;
                
            case 'scenario':
                specificFields = `
                    <div>
                        <label class="block text-sm font-semibold mb-2">Scenario Description *</label>
                        <textarea id="scenario" rows="3" class="w-full p-3 border rounded-lg" placeholder="You notice a spill on the warehouse floor..."></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Choices *</label>
                        <div id="choices-list" class="space-y-3">
                            ${[0,1,2].map(i => `
                                <div class="border rounded-lg p-3 bg-gray-50">
                                    <div class="flex gap-2 mb-2">
                                        <input type="radio" name="scenario-correct" value="${i}" ${i === 0 ? 'checked' : ''}>
                                        <span class="font-semibold">Choice ${String.fromCharCode(65 + i)}</span>
                                    </div>
                                    <input type="text" data-choice="${i}" class="w-full p-2 border rounded mb-2" placeholder="Action to take...">
                                    <textarea data-feedback="${i}" rows="2" class="w-full p-2 border rounded text-sm" placeholder="Feedback for this choice..."></textarea>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="AssessmentBuilder.addChoice()" class="mt-2 text-blue-600 text-sm hover:underline">+ Add another choice</button>
                    </div>
                `;
                break;
                
            case 'fill-blank':
                specificFields = `
                    <div>
                        <label class="block text-sm font-semibold mb-2">Sentence with Blanks *</label>
                        <textarea id="fill-text" rows="3" class="w-full p-3 border rounded-lg" placeholder="Always lift with your ___ not your ___"></textarea>
                        <p class="text-xs text-gray-600 mt-1">Use ___ for each blank</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Correct Answers *</label>
                        <p class="text-xs text-gray-600 mb-2">Enter answers in order (comma separated)</p>
                        <input type="text" id="fill-answers" class="w-full p-3 border rounded-lg" placeholder="legs, back">
                    </div>
                `;
                break;
                
            case 'drag-drop':
                specificFields = `
                    <div>
                        <label class="block text-sm font-semibold mb-2">Instructions</label>
                        <input type="text" id="dd-instructions" class="w-full p-3 border rounded-lg" placeholder="Match each tool to its purpose">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">Items to Drag *</label>
                            <div id="drag-items" class="space-y-2">
                                ${[0,1,2].map(i => `
                                    <input type="text" data-item="${i}" class="w-full p-2 border rounded" placeholder="Item ${i + 1}">
                                `).join('')}
                            </div>
                            <button onclick="AssessmentBuilder.addDragItem()" class="mt-2 text-blue-600 text-sm">+ Add item</button>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold mb-2">Drop Targets *</label>
                            <div id="drop-targets" class="space-y-2">
                                ${[0,1,2].map(i => `
                                    <div class="flex gap-2">
                                        <input type="text" data-target="${i}" class="flex-1 p-2 border rounded" placeholder="Target ${i + 1}">
                                        <select data-correct="${i}" class="p-2 border rounded">
                                            <option value="${i}">Item ${i + 1}</option>
                                        </select>
                                    </div>
                                `).join('')}
                            </div>
                            <button onclick="AssessmentBuilder.addDropTarget()" class="mt-2 text-blue-600 text-sm">+ Add target</button>
                        </div>
                    </div>
                `;
                break;
                
            case 'hotspot':
                specificFields = `
                    <div>
                        <label class="block text-sm font-semibold mb-2">Instructions</label>
                        <input type="text" id="hotspot-instructions" class="w-full p-3 border rounded-lg" placeholder="Click on all safety hazards">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Background Image *</label>
                        <input type="file" id="hotspot-image" accept="image/*" class="w-full p-3 border rounded-lg">
                        <p class="text-xs text-gray-600 mt-1">Upload the image where users will click hotspots</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold mb-2">Number of Hotspots *</label>
                        <input type="number" id="hotspot-count" class="w-full p-3 border rounded-lg" value="3" min="1" max="10">
                        <p class="text-xs text-gray-600 mt-1">You'll position these after uploading the image</p>
                    </div>
                `;
                break;
        }
        
        return `
            <form id="assessment-form" class="space-y-6">
                ${commonFields}
                ${specificFields}
            </form>
            
            <script>
                document.getElementById('is-timed').addEventListener('change', (e) => {
                    document.getElementById('timer-config').classList.toggle('hidden', !e.target.checked);
                });
            </script>
        `;
    },
    
    showPreview() {
        const assessment = this.buildAssessmentObject();
        if (!assessment) {
            alert('Please fill in all required fields');
            return;
        }
        
        document.getElementById('step-preview').classList.remove('hidden');
        document.getElementById('save-btn').classList.remove('hidden');
        
        const preview = document.getElementById('preview-content');
        preview.innerHTML = '<p class="text-gray-600">Preview will appear when you click "Check Answer" in the actual assessment</p>';
        
        // Show a mini preview
        AssessmentEngine.trigger(assessment, this.currentSlideIndex);
    },
    
    buildAssessmentObject() {
        const type = this.selectedType;
        const title = document.getElementById('assessment-title')?.value;
        const canSkip = document.getElementById('can-skip')?.checked;
        const allowRetry = document.getElementById('allow-retry')?.checked;
        const isTimed = document.getElementById('is-timed')?.checked;
        const timeLimit = document.getElementById('time-limit')?.value;
        
        let assessment = {
            type,
            title,
            canSkip,
            allowRetry,
            timed: isTimed,
            timeLimit: isTimed ? parseInt(timeLimit) : null
        };
        
        try {
            switch(type) {
                case 'multiple-choice':
                    const question = document.getElementById('question').value;
                    const options = Array.from(document.querySelectorAll('[data-option]')).map(el => ({ text: el.value }));
                    const correctIdx = parseInt(document.querySelector('input[name="correct"]:checked').value);
                    options[correctIdx].correct = true;
                    
                    assessment = {
                        ...assessment,
                        question,
                        options,
                        correctAnswer: correctIdx,
                        correctFeedback: document.getElementById('correct-feedback').value || 'Correct!',
                        incorrectFeedback: document.getElementById('incorrect-feedback').value || 'Try again.'
                    };
                    break;
                    
                case 'true-false':
                    assessment = {
                        ...assessment,
                        question: document.getElementById('question').value,
                        correctAnswer: document.querySelector('input[name="tf-correct"]:checked').value === 'true',
                        correctFeedback: document.getElementById('feedback').value || 'Correct!',
                        incorrectFeedback: document.getElementById('feedback').value || 'Not quite.'
                    };
                    break;
                    
                case 'scenario':
                    const choices = Array.from(document.querySelectorAll('[data-choice]')).map((el, i) => ({
                        text: el.value,
                        feedback: document.querySelector(`[data-feedback="${i}"]`).value,
                        isCorrect: document.querySelector('input[name="scenario-correct"]:checked').value == i
                    }));
                    
                    assessment = {
                        ...assessment,
                        scenario: document.getElementById('scenario').value,
                        choices
                    };
                    break;
                    
                case 'fill-blank':
                    assessment = {
                        ...assessment,
                        text: document.getElementById('fill-text').value,
                        answers: document.getElementById('fill-answers').value.split(',').map(a => a.trim())
                    };
                    break;
                    
                // Add other types as needed
            }
            
            return assessment;
        } catch (e) {
            console.error('Error building assessment:', e);
            return null;
        }
    },
    
    save() {
        const assessment = this.buildAssessmentObject();
        if (!assessment) {
            alert('Please complete all required fields');
            return;
        }
        
        // Add to current slide
        if (!state.course.slides[this.currentSlideIndex].assessments) {
            state.course.slides[this.currentSlideIndex].assessments = [];
        }
        
        state.course.slides[this.currentSlideIndex].assessments.push(assessment);
        
        this.close();
        alert('✅ Assessment added to slide!');
        
        // Refresh slide display
        renderSlidesList();
    },
    
    close() {
        const modal = document.getElementById('assessment-builder-modal');
        if (modal) modal.remove();
    },
    
    // Helper functions
    addChoice() {
        const list = document.getElementById('choices-list');
        const index = list.children.length;
        const choice = document.createElement('div');
        choice.className = 'border rounded-lg p-3 bg-gray-50';
        choice.innerHTML = `
            <div class="flex gap-2 mb-2">
                <input type="radio" name="scenario-correct" value="${index}">
                <span class="font-semibold">Choice ${String.fromCharCode(65 + index)}</span>
            </div>
            <input type="text" data-choice="${index}" class="w-full p-2 border rounded mb-2" placeholder="Action to take...">
            <textarea data-feedback="${index}" rows="2" class="w-full p-2 border rounded text-sm" placeholder="Feedback..."></textarea>
        `;
        list.appendChild(choice);
    },
    
    addDragItem() {
        const list = document.getElementById('drag-items');
        const index = list.children.length;
        const item = document.createElement('input');
        item.type = 'text';
        item.dataset.item = index;
        item.className = 'w-full p-2 border rounded';
        item.placeholder = `Item ${index + 1}`;
        list.appendChild(item);
    },
    
    addDropTarget() {
        const list = document.getElementById('drop-targets');
        const index = list.children.length;
        const target = document.createElement('div');
        target.className = 'flex gap-2';
        target.innerHTML = `
            <input type="text" data-target="${index}" class="flex-1 p-2 border rounded" placeholder="Target ${index + 1}">
            <select data-correct="${index}" class="p-2 border rounded">
                <option value="${index}">Item ${index + 1}</option>
            </select>
        `;
        list.appendChild(target);
    }
};

// Make globally available
window.AssessmentBuilder = AssessmentBuilder;
