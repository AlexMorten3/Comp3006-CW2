function register(event) {
    event.preventDefault();
    console.log('Register function called.');
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                showBookingForms();
            } else {
                alert('Registration failed. Please try again.');
            }
        })
        .catch((error) => {
            console.error('Error during registration:', error);
        });
}