const SuccessPage = () => {
    return (
      <div className="container text-center mt-5">
        <h2 className="mb-4 text-success"> Listing Submitted Successfully!</h2>
        <p className="lead">Your listing has been published. Thank you!</p>
  
        {/* Optional: add a button to return home or create another listing */}
        <a href="/" className="btn btn-primary mt-4">
          Go to Homepage
        </a>
      </div>
    );
  };
  
  export default SuccessPage;
  