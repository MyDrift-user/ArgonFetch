namespace ArgonFetch.Application.Exceptions
{
    /// <summary>
    /// Exception thrown when an unknown or unsupported content type is encountered.
    /// </summary>
    public class UnknownContentTypeException : System.Exception
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UnknownContentTypeException"/> class.
        /// </summary>
        public UnknownContentTypeException() : base("Unknown or unsupported content type.")
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="UnknownContentTypeException"/> class with a specified error message.
        /// </summary>
        /// <param name="message">The message that describes the error.</param>
        public UnknownContentTypeException(string message) : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="UnknownContentTypeException"/> class with a specified error message and inner exception.
        /// </summary>
        /// <param name="message">The message that describes the error.</param>
        /// <param name="innerException">The exception that caused the current exception.</param>
        public UnknownContentTypeException(string message, System.Exception innerException) : base(message, innerException)
        {
        }
    }
}
