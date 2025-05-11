import { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepFour";
import StepFive from "./StepFive";
import StepSix from "./StepSix";
import SuccessPage from "./SuccessPage";
import { PostListingFormData } from "./types";


const PostListing = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<PostListingFormData>({
    listingType: "",
    propertyType: "",
    userType: "",
    livesInProperty: false,
  });

  const onNext = () => setStep((prev) => prev + 1);
  const onBack = () => setStep((prev) => prev - 1);

 /* let displayedStep = step;

  if (formData.listingType === "entire_property" && step > 2) {
    displayedStep = step ;
  }
    */


  const getCurrentStepComponent = () => {

    if (submitted) {
        return <SuccessPage />;
    }
     
    const commonProps = {
      formData,
      setFormData,
      onNext,
      onBack,
    };

   // if (submitted) {
   //   return <SuccessPage />;
   // }
  
    switch (step) {
      case 1:
        return <StepOne {...commonProps} onNext={onNext} />;
      case 2:
        return <StepTwo {...commonProps} onNext={onNext} onBack={onBack} />;
      case 3:
        if (formData.listingType === "entire_property") {
          return <StepFour {...commonProps} displayedStep={3} />;
        } else {
          return <StepThree {...commonProps} onNext={onNext} onBack={onBack} />;
        }
      case 4:
        if (formData.listingType === "room") {
          return <StepFour {...commonProps} displayedStep={4} />;
        } else {
          return <StepFive {...commonProps} displayedStep={4} />;
        }
      case 5:
        if(formData.listingType === "room")
        {
          return (
          <StepFive
            {...commonProps}
            displayedStep={formData.listingType === "room" ? 5 : 4}
          />
        );
      } else{
        return (
          <StepSix
            formData={formData}
            setFormData={setFormData}
            onBack={onBack}
            displayedStep={5}
            setSubmitted={setSubmitted}
          />
        );
      }
      case 6:
        return (
          <StepSix
            formData={formData}
            setFormData={setFormData}
            onBack={onBack}
            displayedStep={6}
            setSubmitted={setSubmitted}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };
  


  return <div className="container mt-4">{
    getCurrentStepComponent()
    }</div>;

  
};

export default PostListing;
