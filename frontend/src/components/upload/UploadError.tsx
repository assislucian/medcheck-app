interface UploadErrorProps {
  message: string;
}

const UploadError = ({ message }: UploadErrorProps) => {
  if (!message) return null;

  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
      {message}
    </div>
  );
};

export default UploadError;
