import Button from "../../../components/shared/Button";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.15 0 5.99 1.09 8.24 3.23l6.14-6.14C35.66 3.26 30.31 1 24 1 14.59 1 6.43 6.39 2.48 14.24l7.16 5.57C11.52 13.55 17.28 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.58-.14-3.09-.4-4.5H24v8.52h12.7c-.55 2.96-2.22 5.47-4.74 7.15l7.24 5.62C43.88 37.47 46.5 31.74 46.5 24.5z"
    />
    <path
      fill="#FBBC05"
      d="M9.64 28.81A14.48 14.48 0 0 1 8.8 24c0-1.68.29-3.3.84-4.81L2.48 13.6A23.9 23.9 0 0 0 0 24c0 3.84.92 7.47 2.48 10.4l7.16-5.59z"
    />
    <path
      fill="#34A853"
      d="M24 47c6.49 0 11.94-2.13 15.92-5.81l-7.24-5.62c-2.02 1.36-4.6 2.17-8.68 2.17-6.72 0-12.48-4.05-14.36-9.81l-7.16 5.59C6.42 41.61 14.58 47 24 47z"
    />
  </svg>
);

const GoogleAuthButton = ({ children, onClick, disabled = false }) => {
  return (
    <Button
      type="button"
      variant="secondary"
      fullWidth
      onClick={onClick}
      disabled={disabled}
      className="bg-white/95"
    >
      <GoogleIcon />
      <span>{children}</span>
    </Button>
  );
};

export default GoogleAuthButton;
