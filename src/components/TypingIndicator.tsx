const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-smart-blue [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-smart-blue [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-smart-blue" />
      </div>
      <span className="ml-2 text-sm text-muted-foreground">SmartAssist is typing...</span>
    </div>
  );
};

export default TypingIndicator;
