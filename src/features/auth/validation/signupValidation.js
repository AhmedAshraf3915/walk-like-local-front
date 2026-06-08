const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSignupForm = ({
	fullName,
	email,
	password,
	confirmPassword,
	role,
}) => {
	const errors = {};

	if (!fullName?.trim()) {
		errors.fullName = "Full name is required.";
	}

	if (!email?.trim()) {
		errors.email = "Email is required.";
	} else if (!emailPattern.test(email.trim())) {
		errors.email = "Enter a valid email address.";
	}

	if (!password) {
		errors.password = "Password is required.";
	}

	if (!confirmPassword) {
		errors.confirmPassword = "Please confirm your password.";
	} else if (password !== confirmPassword) {
		errors.confirmPassword = "Passwords do not match.";
	}

	if (!role) {
		errors.role = "Please choose a role.";
	}

	return errors;
};