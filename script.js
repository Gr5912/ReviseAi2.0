document.getElementById('submit-prompt').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value;
    const responseOutput = document.getElementById('response-output');

    if (!prompt) {
        responseOutput.innerHTML = '<p>Please enter a prompt.</p>';
        return;
    }

    responseOutput.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            // Improved error handling
            let errorMessage = `Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage += `<br>${errorData.error}`;
                }
            } catch (e) {
                // If JSON parsing fails, fall back to text
                const errorText = await response.text();
                errorMessage += `<br>${errorText}`;
            }
            responseOutput.innerHTML = `<p>${errorMessage}</p>`;
            return;
        }

        const data = await response.json();
        if (data && data.response) {
            const markdownText = data.response;
            const html = marked.parse(markdownText);
            responseOutput.innerHTML = html;

            // Process MathJax if available
            if (window.MathJax) {
                MathJax.typesetPromise([responseOutput])
                    .catch(function (err) {
                        console.error("MathJax typesetting error:", err);
                    });
            } else {
                console.warn("MathJax not loaded");
            }
        } else {
            responseOutput.innerHTML = "<p>No response received from the server.</p>";
        }

    } catch (error) {
        responseOutput.innerHTML = `<p>Error: ${error.message}</p>`;
        console.error("Fetch error:", error); // Log the error for debugging
    }
});