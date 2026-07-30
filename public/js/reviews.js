document.addEventListener('DOMContentLoaded', () => {
	const reviewForm = document.getElementById('customer-review-form');

	if (!reviewForm) {
		return;
	}

	const messageElement =
		document.getElementById('review-form-message');

	const submitButton =
		reviewForm.querySelector('.review-submit-button');

	reviewForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const tripCode = reviewForm.dataset.tripCode;

		if (!tripCode) {
			showMessage(
				'Unable to determine which trip is being reviewed.',
				'error'
			);
			return;
		}

		const formData = new FormData(reviewForm);

		const review = {
			reviewerName:
				formData.get('reviewerName')?.toString().trim(),
			rating: Number(formData.get('rating')),
			comment:
				formData.get('comment')?.toString().trim()
		};

		if (
			!review.reviewerName ||
			!Number.isInteger(review.rating) ||
			review.rating < 1 ||
			review.rating > 5 ||
			!review.comment
		) {
			showMessage(
				'Please complete all review fields.',
				'error'
			);
			return;
		}

		setSubmitting(true);
		showMessage('Submitting your review...', '');

		try {
			const response = await fetch(
				`/api/trips/${encodeURIComponent(tripCode)}/reviews`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(review)
				}
			);

			let responseBody = {};

			try {
				responseBody = await response.json();
			} catch {
				responseBody = {};
			}

			if (!response.ok) {
				throw new Error(
					responseBody.message ||
					'The review could not be submitted.'
				);
			}

			reviewForm.reset();

			showMessage(
                '✓ Thank you! Your review was submitted successfully.',
                'success'
            );

			window.setTimeout(() => {
				window.location.hash = 'customer-reviews';
				window.location.reload();
			}, 1500);
		} catch (error) {
			console.error('Unable to submit review:', error);

			showMessage(
				error.message ||
				'An unexpected error occurred while submitting the review.',
				'error'
			);
		} finally {
			setSubmitting(false);
		}
	});

	function showMessage(message, type) {
		if (!messageElement) {
			return;
		}

		messageElement.textContent = message;
		messageElement.classList.remove('success', 'error');

		if (type) {
			messageElement.classList.add(type);
		}
	}

	function setSubmitting(isSubmitting) {
        const formControls = reviewForm.querySelectorAll(
            'input, select, textarea, button'
        );

        formControls.forEach((control) => {
            control.disabled = isSubmitting;
        });

        if (submitButton) {
            submitButton.textContent = isSubmitting
                ? 'Submitting...'
                : 'Submit Review';
        }
    }
});