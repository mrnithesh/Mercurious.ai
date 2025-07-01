// Main frontend logic
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('video-form');
    const videoInput = document.getElementById('video-url');
    const processBtn = document.getElementById('process-btn');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const results = document.getElementById('results');

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = videoInput.value.trim();
        
        if (!url || !apiClient.isValidYouTubeUrl(url)) {
            showError('Please enter a valid YouTube URL');
            return;
        }

        try {
            showLoading();
            const data = await apiClient.processVideo(url);
            showResults(data);
        } catch (err) {
            showError(err.message);
        }
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    function showLoading() {
        hideAll();
        loading.classList.remove('hidden');
        processBtn.disabled = true;
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    function showError(message) {
        hideAll();
        error.classList.remove('hidden');
        document.getElementById('error-message').textContent = message;
        processBtn.disabled = false;
        processBtn.innerHTML = '<i class="fas fa-play"></i> Process Video';
    }

    function showResults(data) {
        hideAll();
        
        // Populate video info
        document.getElementById('video-thumbnail').src = data.info.thumbnail_url;
        document.getElementById('video-title').textContent = data.info.title;
        document.getElementById('video-author').textContent = data.info.author;
        document.getElementById('video-duration').textContent = data.info.duration;
        document.getElementById('video-views').textContent = data.info.views.toLocaleString();

        // Populate content
        document.getElementById('summary-content').innerHTML = formatText(data.content.summary);
        document.getElementById('points-content').innerHTML = formatList(data.content.main_points);
        document.getElementById('concepts-content').innerHTML = formatList(data.content.key_concepts);
        document.getElementById('study-content').innerHTML = formatText(data.content.study_guide);
        document.getElementById('vocab-content').innerHTML = formatList(data.content.vocabulary);
        document.getElementById('analysis-content').innerHTML = formatText(data.content.analysis);

        results.classList.remove('hidden');
        switchTab('summary');
        processBtn.disabled = false;
        processBtn.innerHTML = '<i class="fas fa-play"></i> Process Video';
    }

    function switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => 
            btn.classList.toggle('active', btn.dataset.tab === tabName)
        );
        document.querySelectorAll('.tab-panel').forEach(panel => 
            panel.classList.toggle('active', panel.id === `tab-${tabName}`)
        );
    }

    function hideAll() {
        [loading, error, results].forEach(el => el.classList.add('hidden'));
    }

    function formatText(text) {
        return text ? `<p>${text.replace(/\n/g, '</p><p>')}</p>` : '<p>No content available</p>';
    }

    function formatList(items) {
        return items?.length ? `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>` : '<p>No items available</p>';
    }

    // Global functions for HTML
    window.clearError = () => {
        error.classList.add('hidden');
        videoInput.value = '';
        videoInput.focus();
    };

    window.processNewVideo = () => {
        hideAll();
        videoInput.value = '';
        videoInput.focus();
    };

    window.downloadResults = () => {
        // Simple download functionality can be added here if needed
        console.log('Download functionality can be implemented');
    };
});
