/* ==========================================================================
   WAGA WELLNESS — Order Page Scripts

   Multi-step form wizard, validation, review population, FAQ accordion.
   ========================================================================== */

(function () {
    'use strict';

    /* -------------------------------------------------------------------
       1. DOM REFERENCES
       ------------------------------------------------------------------- */

    var steps = document.querySelectorAll('.order-step');
    var stepIndicatorText = document.querySelector('.step-indicator-text');
    var stepIndicatorFill = document.querySelector('.step-indicator-fill');
    var stepDots = document.querySelectorAll('.step-dot');
    var currentStep = 1;
    var totalSteps = 4; // active steps (5th is confirmation)

    /* -------------------------------------------------------------------
       1b. CHIP GROUP MULTI-SELECT
       ------------------------------------------------------------------- */

    document.querySelectorAll('.form-chip-group').forEach(function (group) {
        var hiddenInput = document.getElementById(group.getAttribute('data-field'));

        function syncHidden() {
            var selected = [];
            group.querySelectorAll('.form-chip.selected').forEach(function (chip) {
                selected.push(chip.getAttribute('data-value'));
            });
            if (hiddenInput) hiddenInput.value = selected.join(', ');
        }

        group.querySelectorAll('.form-chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                var val = chip.getAttribute('data-value');

                if (val === 'None') {
                    // Select None, deselect everything else
                    group.querySelectorAll('.form-chip').forEach(function (c) {
                        c.classList.remove('selected');
                    });
                    chip.classList.add('selected');
                } else {
                    // Deselect None chip if present
                    var noneChip = group.querySelector('.form-chip[data-value="None"]');
                    if (noneChip) noneChip.classList.remove('selected');

                    // Toggle this chip
                    chip.classList.toggle('selected');
                }

                syncHidden();
            });
        });
    });

    /* -------------------------------------------------------------------
       2. STEP NAVIGATION
       ------------------------------------------------------------------- */

    function showStep(n) {
        steps.forEach(function (step) {
            step.classList.remove('active');
        });

        var target = document.getElementById('step-' + n);
        if (target) {
            target.classList.add('active');
            currentStep = n;
            updateIndicator();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function updateIndicator() {
        if (currentStep <= totalSteps) {
            stepIndicatorText.textContent = 'Step ' + currentStep + ' of ' + totalSteps;
            stepIndicatorFill.style.width = ((currentStep / totalSteps) * 100) + '%';
        } else {
            // Confirmation
            stepIndicatorText.textContent = 'Complete';
            stepIndicatorFill.style.width = '100%';
        }

        // Update dots
        stepDots.forEach(function (dot, index) {
            dot.classList.remove('active', 'completed');
            if (index + 1 === currentStep) {
                dot.classList.add('active');
            } else if (index + 1 < currentStep) {
                dot.classList.add('completed');
            }
        });
    }

    function goNext() {
        if (currentStep >= totalSteps) return;
        if (!validateStep(currentStep)) return;
        showStep(currentStep + 1);
    }

    function goBack() {
        if (currentStep <= 1) return;
        showStep(currentStep - 1);
    }

    function goToStep(n) {
        showStep(n);
    }

    // Next buttons
    document.querySelectorAll('[data-action="next"]').forEach(function (btn) {
        btn.addEventListener('click', goNext);
    });

    // Back buttons
    document.querySelectorAll('[data-action="back"]').forEach(function (btn) {
        btn.addEventListener('click', goBack);
    });

    // Edit buttons (review step)
    document.querySelectorAll('[data-action="edit"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var targetStep = parseInt(this.getAttribute('data-target'), 10);
            goToStep(targetStep);
        });
    });


    /* -------------------------------------------------------------------
       3. VALIDATION
       ------------------------------------------------------------------- */

    function validateStep(step) {
        var stepEl = document.getElementById('step-' + step);
        if (!stepEl) return true;

        var requiredFields = stepEl.querySelectorAll('[required]');
        var valid = true;

        requiredFields.forEach(function (field) {
            clearFieldError(field);

            if (field.type === 'radio') {
                // Check if any radio in the group is selected
                var name = field.name;
                var groupChecked = stepEl.querySelector('input[name="' + name + '"]:checked');
                if (!groupChecked) {
                    showFieldError(field, 'Please select an option');
                    valid = false;
                }
            } else if (!field.value.trim()) {
                showFieldError(field, 'This field is required');
                valid = false;
            } else if (field.type === 'email' && !isValidEmail(field.value)) {
                showFieldError(field, 'Please enter a valid email address');
                valid = false;
            }
        });

        return valid;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        var errorEl = field.closest('.form-group').querySelector('.form-error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('visible');
        }
    }

    function clearFieldError(field) {
        field.classList.remove('error');
        var errorEl = field.closest('.form-group');
        if (errorEl) {
            var msg = errorEl.querySelector('.form-error-message');
            if (msg) {
                msg.classList.remove('visible');
            }
        }
    }

    // Clear errors on input
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(function (field) {
        field.addEventListener('input', function () {
            clearFieldError(this);
        });
    });

    document.querySelectorAll('input[type="radio"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            // Clear error on the first radio of the group
            var group = document.querySelector('input[name="' + this.name + '"]');
            if (group) clearFieldError(group);
        });
    });


    /* -------------------------------------------------------------------
       4. REVIEW STEP — POPULATE SUMMARY
       ------------------------------------------------------------------- */

    function populateReview() {
        // Program
        setReviewValue('review-program', '5-Day Detox Box — $2,000');

        // Diet
        var dietRadio = document.querySelector('input[name="diet"]:checked');
        setReviewValue('review-diet', dietRadio ? dietRadio.value : '');

        // Health fields
        setReviewValue('review-allergies', getFieldValue('allergies'));
        setReviewValue('review-chronic', getFieldValue('chronic'));
        setReviewValue('review-medications', getFieldValue('medications'));
        setReviewValue('review-dislikes', getFieldValue('dislikes'));
        setReviewValue('review-health-notes', getFieldValue('health-notes'));

        // Delivery fields
        setReviewValue('review-name', getFieldValue('full-name'));
        setReviewValue('review-email', getFieldValue('email'));
        setReviewValue('review-phone', getFieldValue('phone'));
        setReviewValue('review-address', getFieldValue('address'));
        setReviewValue('review-delivery-notes', getFieldValue('delivery-notes'));
    }

    function getFieldValue(id) {
        var field = document.getElementById(id);
        if (!field) return '';
        // For chip groups the value is stored in a hidden input
        // For selects and regular inputs just use .value
        return field.value.trim();
    }

    function setReviewValue(id, value) {
        var el = document.getElementById(id);
        if (!el) return;

        if (value) {
            el.textContent = value;
            el.classList.remove('empty');
        } else {
            el.textContent = 'Not provided';
            el.classList.add('empty');
        }
    }

    // Populate review when entering step 4
    var originalShowStep = showStep;
    showStep = function (n) {
        if (n === 4) populateReview();
        originalShowStep(n);
    };


    /* -------------------------------------------------------------------
       5. FORM SUBMISSION
       ------------------------------------------------------------------- */

    var orderForm = document.getElementById('order-form');

    if (orderForm) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateStep(currentStep)) return;

            // Show confirmation step
            steps.forEach(function (step) {
                step.classList.remove('active');
            });

            var confirmation = document.getElementById('step-5');
            if (confirmation) {
                confirmation.classList.add('active');
                currentStep = 5;
                updateIndicator();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }


    /* -------------------------------------------------------------------
       6. FAQ ACCORDION
       ------------------------------------------------------------------- */

    var faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
        var question = item.querySelector('.faq-question');
        var answer = item.querySelector('.faq-answer');

        question.addEventListener('click', function () {
            var isOpen = item.classList.contains('open');

            // Close all other items
            faqItems.forEach(function (otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove('open');
                    var otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) otherAnswer.style.maxHeight = null;
                }
            });

            // Toggle this item
            if (isOpen) {
                item.classList.remove('open');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });

        // Keyboard support
        question.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });


    /* -------------------------------------------------------------------
       7. INITIALIZE
       ------------------------------------------------------------------- */

    showStep(1);

})();
