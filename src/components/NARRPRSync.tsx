// Add to the NARRPRSync component's render method

{status.integrityChecks && status.integrityChecks.length > 0 && (
  <div className="mt-4 space-y-2">
    <div className="text-sm font-semibold">Data Integrity Checks</div>
    <div className="space-y-1">
      {status.integrityChecks.map((check, index) => (
        <div
          key={index}
          className={\`p-2 rounded-lg text-sm \${
            check.type === 'error'
              ? 'bg-red-500/10 text-red-500'
              : 'bg-yellow-500/10 text-yellow-500'
          }\`}
        >
          <span className="font-medium">{check.field}:</span> {check.message}
        </div>
      ))}
    </div>
  </div>
)}