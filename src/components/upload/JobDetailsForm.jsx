export default function JobDetailsForm({
  jobTitle,
  jobDescription,
  onJobTitleChange,
  onJobDescriptionChange,
}) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="jobTitle" className="label-text">
          Job Title
        </label>
        <input
          id="jobTitle"
          type="text"
          placeholder="e.g. Frontend Developer"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="jobDescription" className="label-text">
          Job Description
        </label>
        <textarea
          id="jobDescription"
          rows={8}
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          className="input-field resize-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          {jobDescription.length} characters
        </p>
      </div>
    </div>
  );
}