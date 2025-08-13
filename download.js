document.getElementById('downloadForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const email = document.getElementById('emailInput').value;
    const industry = document.getElementById('industrySelect').value;

    fetch('/download-resume', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, industry: industry }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            
            const link = document.createElement('a');
            link.href = data.resumeUrl;
            link.download = data.resumeUrl.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

          
            const myModal = bootstrap.Modal.getInstance(document.getElementById('resumeModal'));
            myModal.hide();

            alert('Your resume is downloading! Thank you for your interest.');
        } else {
            alert('Something went wrong. Please try again.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});