// DOM elements
const barsContainer = document.getElementById('bars-container');
const arraySizeSlider = document.getElementById('array-size');
const sizeValue = document.getElementById('size-value');
const generateArrayBtn = document.getElementById('generate-array');
const algorithmSelect = document.getElementById('algorithm-select');
const sortBtn = document.getElementById('sort-btn');
const animationSpeedSlider = document.getElementById('animation-speed');
const speedValue = document.getElementById('speed-value');
const currentAlgorithm = document.getElementById('current-algorithm');
const timeComplexity = document.getElementById('time-complexity');
const spaceComplexity = document.getElementById('space-complexity');
const algorithmDescription = document.getElementById('algorithm-description');

// Global variables
let array = [];
let bars = [];
let arraySize = arraySizeSlider.value;
let animationSpeed = 101 - animationSpeedSlider.value;
let isSorting = false;

// Algorithm information
const algorithmInfo = {
    bubble: {
        name: 'Bubble Sort',
        time: 'O(n²)',
        space: 'O(1)',
        description: 'Bubble sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.'
    },
    selection: {
        name: 'Selection Sort',
        time: 'O(n²)',
        space: 'O(1)',
        description: 'Selection sort divides the array into a sorted and unsorted region, and repeatedly selects the smallest element from the unsorted region and moves it to the sorted region.'
    },
    insertion: {
        name: 'Insertion Sort',
        time: 'O(n²)',
        space: 'O(1)',
        description: 'Insertion sort builds the final sorted array one item at a time, taking each element from the input and inserting it into its correct position.'
    },
    merge: {
        name: 'Merge Sort',
        time: 'O(n log n)',
        space: 'O(n)',
        description: 'Merge sort is an efficient divide-and-conquer algorithm that divides the array into halves, sorts them separately, and then merges the sorted halves.'
    },
    quick: {
        name: 'Quick Sort',
        time: 'O(n log n)',
        space: 'O(log n)',
        description: 'Quick sort works by selecting a "pivot" element and partitioning the array around the pivot, placing smaller elements before it and larger elements after it.'
    },
    heap: {
        name: 'Heap Sort',
        time: 'O(n log n)',
        space: 'O(1)',
        description: 'Heap sort converts the array into a max heap, then repeatedly extracts the maximum element and rebuilds the heap until the array is sorted.'
    }
};

// Sound Effects System
class SoundSystem {
    constructor() {
        this.context = null;
        this.sounds = {
            select: null,
            hover: null,
            transition: null
        };
        this.enabled = true;
        this.initialize();
    }
    
    initialize() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            this.loadSounds();
        } catch(e) {
            console.warn('Web Audio API is not supported in this browser');
        }
    }
    
    async loadSounds() {
        await this.loadSound('select', 'sounds/select.wav');
        await this.loadSound('hover', 'sounds/hover.wav');
        await this.loadSound('transition', 'sounds/transition.wav');
    }
    
    async loadSound(name, url) {
        if (!this.context) return;
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.sounds[name] = audioBuffer;
        } catch(e) {
            console.error(`Error loading sound ${name}: ${e.message}`);
        }
    }
    
    playSound(name, options = {}) {
        if (!this.context || !this.sounds[name] || !this.enabled) return;
        
        const source = this.context.createBufferSource();
        source.buffer = this.sounds[name];
        
        // Create gain node for volume control
        const gainNode = this.context.createGain();
        gainNode.gain.value = options.volume || 0.3; // Default lower volume
        
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        source.start(0);
    }
    
    // Play tone based on array value (for comparisons)
    playToneForValue(value, maxValue) {
        if (!this.context || !this.enabled) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        // Map value to frequency (300-1200Hz)
        const frequency = 300 + (value / maxValue) * 900;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        gainNode.gain.value = 0.1;
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.1);
    }
    
    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Create global sound instance
const soundFx = new SoundSystem();

// Initialize the page
window.addEventListener('load', initialize);

function initialize() {
    updateAlgorithmInfo();
    generateNewArray();
    
    // Set up event listeners
    generateArrayBtn.addEventListener('click', generateNewArray);
    arraySizeSlider.addEventListener('input', updateArraySize);
    animationSpeedSlider.addEventListener('input', updateAnimationSpeed);
    algorithmSelect.addEventListener('change', updateAlgorithmInfo);
    sortBtn.addEventListener('click', startSorting);
    
    // Add sound toggle if it exists in the DOM
    const soundToggleBtn = document.getElementById('toggle-sound');
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            const isSoundOn = soundFx.toggleSound();
            soundToggleBtn.innerHTML = isSoundOn ? 
                '<i class="fas fa-volume-up"></i> Sound On' : 
                '<i class="fas fa-volume-mute"></i> Sound Off';
        });
    }
}

// Update the information displayed about the selected algorithm
function updateAlgorithmInfo() {
    const algorithm = algorithmSelect.value;
    const info = algorithmInfo[algorithm];
    
    currentAlgorithm.textContent = info.name;
    timeComplexity.textContent = info.time;
    spaceComplexity.textContent = info.space;
    algorithmDescription.textContent = info.description;
}

// Generate a new random array
function generateNewArray() {
    if (isSorting) return;
    
    array = [];
    barsContainer.innerHTML = '';
    bars = [];
    
    for (let i = 0; i < arraySize; i++) {
        // Generate random values between 5 and 100
        const value = Math.floor(Math.random() * 96) + 5;
        array.push(value);
        
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value * 3}px`;
        barsContainer.appendChild(bar);
        bars.push(bar);
    }
}

// Update the array size
function updateArraySize() {
    if (isSorting) return;
    
    arraySize = arraySizeSlider.value;
    sizeValue.textContent = arraySize;
    generateNewArray();
}

// Update animation speed
function updateAnimationSpeed() {
    animationSpeed = 101 - animationSpeedSlider.value;
    speedValue.textContent = animationSpeedSlider.value;
}

// Function to start sorting based on selected algorithm
function startSorting() {
    if (isSorting) return;
    isSorting = true;
    
    const algorithm = algorithmSelect.value;
    
    switch(algorithm) {
        case 'bubble':
            bubbleSort();
            break;
        case 'selection':
            selectionSort();
            break;
        case 'insertion':
            insertionSort();
            break;
        case 'merge':
            mergeSort();
            break;
        case 'quick':
            quickSort();
            break;
        case 'heap':
            heapSort();
            break;
    }
}

// Sleep function for animations
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility function to update bar styles during sorting
async function updateBar(index, status) {
    bars[index].classList.remove('current', 'comparing', 'sorted');
    if (status) {
        bars[index].classList.add(status);
        
        // Play different sounds based on the status
        if (status === 'comparing') {
            soundFx.playSound('hover');
        } else if (status === 'current') {
            soundFx.playToneForValue(array[index], 100);
        } else if (status === 'sorted') {
            soundFx.playSound('transition', { volume: 0.2 });
        }
    }
}

// Reset all bars to default style
function resetBarStyles() {
    for (let i = 0; i < bars.length; i++) {
        bars[i].classList.remove('current', 'comparing', 'sorted');
    }
}

// Swap function: both array values and bars visualization
async function swap(i, j) {
    // Swap in array
    [array[i], array[j]] = [array[j], array[i]];
    
    // Update bar heights
    [bars[i].style.height, bars[j].style.height] = [bars[j].style.height, bars[i].style.height];
    
    // Visualize the swap
    await updateBar(i, 'comparing');
    await updateBar(j, 'comparing');
    
    // Play swap sound
    soundFx.playSound('select', { volume: 0.4 });
    
    await sleep(animationSpeed);
    await updateBar(i, null);
    await updateBar(j, null);
}

// Bubble Sort Implementation
async function bubbleSort() {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            await updateBar(j, 'current');
            await updateBar(j + 1, 'comparing');
            
            if (array[j] > array[j + 1]) {
                await swap(j, j + 1);
            }
            
            await updateBar(j, null);
            await updateBar(j + 1, null);
        }
        await updateBar(array.length - i - 1, 'sorted');
    }
    
    finishSorting();
}

// Selection Sort Implementation
async function selectionSort() {
    for (let i = 0; i < array.length; i++) {
        let minIndex = i;
        await updateBar(i, 'current');
        
        for (let j = i + 1; j < array.length; j++) {
            await updateBar(j, 'comparing');
            
            if (array[j] < array[minIndex]) {
                await updateBar(minIndex, null);
                minIndex = j;
                await updateBar(minIndex, 'current');
            } else {
                await sleep(animationSpeed / 2);
                await updateBar(j, null);
            }
        }
        
        if (minIndex !== i) {
            await swap(i, minIndex);
            await updateBar(minIndex, null);
        }
        
        await updateBar(i, 'sorted');
    }
    
    finishSorting();
}

// Insertion Sort Implementation
async function insertionSort() {
    for (let i = 1; i < array.length; i++) {
        let j = i;
        await updateBar(i, 'current');
        
        while (j > 0 && array[j] < array[j - 1]) {
            await updateBar(j - 1, 'comparing');
            await swap(j, j - 1);
            await updateBar(j, null);
            j--;
        }
        
        await updateBar(j, 'sorted');
    }
    
    finishSorting();
}

// Merge Sort Implementation
async function mergeSort() {
    await mergeSortHelper(0, array.length - 1);
    
    // Mark all as sorted at the end
    for (let i = 0; i < array.length; i++) {
        await updateBar(i, 'sorted');
        await sleep(animationSpeed / 4);
    }
    
    finishSorting();
}

async function mergeSortHelper(start, end) {
    if (start >= end) return;
    
    const mid = Math.floor((start + end) / 2);
    await mergeSortHelper(start, mid);
    await mergeSortHelper(mid + 1, end);
    await merge(start, mid, end);
}

async function merge(start, mid, end) {
    const tempArray = [];
    let i = start, j = mid + 1, k = 0;
    
    while (i <= mid && j <= end) {
        await updateBar(i, 'current');
        await updateBar(j, 'comparing');
        await sleep(animationSpeed);
        
        if (array[i] <= array[j]) {
            tempArray[k++] = array[i++];
        } else {
            tempArray[k++] = array[j++];
        }
    }
    
    while (i <= mid) {
        await updateBar(i, 'current');
        await sleep(animationSpeed);
        tempArray[k++] = array[i++];
    }
    
    while (j <= end) {
        await updateBar(j, 'comparing');
        await sleep(animationSpeed);
        tempArray[k++] = array[j++];
    }
    
    for (i = start, k = 0; i <= end; i++, k++) {
        array[i] = tempArray[k];
        bars[i].style.height = `${array[i] * 3}px`;
        await updateBar(i, 'comparing');
        await sleep(animationSpeed);
        await updateBar(i, null);
    }
}

// Quick Sort Implementation
async function quickSort() {
    await quickSortHelper(0, array.length - 1);
    
    // Mark all as sorted at the end
    for (let i = 0; i < array.length; i++) {
        await updateBar(i, 'sorted');
        await sleep(animationSpeed / 4);
    }
    
    finishSorting();
}

async function quickSortHelper(start, end) {
    if (start >= end) return;
    
    const pivotIndex = await partition(start, end);
    await quickSortHelper(start, pivotIndex - 1);
    await quickSortHelper(pivotIndex + 1, end);
}

async function partition(start, end) {
    const pivotValue = array[end];
    await updateBar(end, 'current');
    
    let pivotIndex = start;
    
    for (let i = start; i < end; i++) {
        await updateBar(i, 'comparing');
        await sleep(animationSpeed);
        
        if (array[i] < pivotValue) {
            if (i !== pivotIndex) {
                await swap(i, pivotIndex);
            }
            await updateBar(pivotIndex, null);
            pivotIndex++;
        }
        
        await updateBar(i, null);
    }
    
    await swap(pivotIndex, end);
    await updateBar(end, null);
    await updateBar(pivotIndex, 'sorted');
    
    return pivotIndex;
}

// Heap Sort Implementation
async function heapSort() {
    // Build max heap
    for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
        await heapify(array.length, i);
    }
    
    // Extract elements from heap one by one
    for (let i = array.length - 1; i > 0; i--) {
        await swap(0, i);
        await updateBar(i, 'sorted');
        await heapify(i, 0);
    }
    
    await updateBar(0, 'sorted');
    finishSorting();
}

async function heapify(n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    await updateBar(i, 'current');
    
    if (left < n) {
        await updateBar(left, 'comparing');
        await sleep(animationSpeed);
        
        if (array[left] > array[largest]) {
            await updateBar(largest, null);
            largest = left;
            await updateBar(largest, 'current');
        }
        
        await updateBar(left, null);
    }
    
    if (right < n) {
        await updateBar(right, 'comparing');
        await sleep(animationSpeed);
        
        if (array[right] > array[largest]) {
            await updateBar(largest, null);
            largest = right;
            await updateBar(largest, 'current');
        }
        
        await updateBar(right, null);
    }
    
    if (largest !== i) {
        await swap(i, largest);
        await updateBar(i, null);
        await updateBar(largest, null);
        await heapify(n, largest);
    } else {
        await updateBar(i, null);
    }
}

// Mark the end of sorting
function finishSorting() {
    isSorting = false;
    resetBarStyles();
    
    // Play completion sound
    soundFx.playSound('transition', { volume: 0.5 });
    
    // Mark all bars as sorted
    for (let i = 0; i < bars.length; i++) {
        bars[i].classList.add('sorted');
    }
}
