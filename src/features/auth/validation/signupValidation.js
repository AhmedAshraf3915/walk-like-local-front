const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fullNamePattern = /^[A-Za-z\s'-]+$/;

const PASSWORD_REQUIREMENTS_MESSAGE =
	"Password must:\n• Be at least 8 characters long\n• Include an uppercase letter\n• Include a number\n• Include a special character";

const hasStrongPassword = (password) => {
	if (typeof password !== "string") {
		return false;
	}

	const hasMinLength = password.length >= 8;
	const hasUppercase = /[A-Z]/.test(password);
	const hasNumber = /\d/.test(password);
	const hasSpecial = /[^A-Za-z0-9]/.test(password);

	return hasMinLength && hasUppercase && hasNumber && hasSpecial;
};

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
	} else if (!fullNamePattern.test(fullName.trim())) {
		errors.fullName = "Full name accepts characters only.";
	}

	if (!email?.trim()) {
		errors.email = "Email is required.";
	} else if (!emailPattern.test(email.trim())) {
		errors.email = "Enter a valid email address.";
	}

	if (!password) {
		errors.password = "Password is required.";
	} else if (!hasStrongPassword(password)) {
		errors.password = PASSWORD_REQUIREMENTS_MESSAGE;
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