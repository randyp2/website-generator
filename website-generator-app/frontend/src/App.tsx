import { motion } from "framer-motion";
import React, { useEffect, useReducer, useState } from "react";

import { initialState } from "./types/formTypes";
import { formReducer } from "./components/Form/hooks/useReducerHook";
import FormContainer from "./components/Form/FormContainer";
import PreviewContainer from "./components/Preview/PreviewContainer";




const App: React.FC = () => {
  // Contains form state containing user's portfolio info
  const [state, dispatch] = useReducer(formReducer, initialState); 

  // Generated html/css code
  const [generatedHTML, setGeneratedHTML] = useState<string | null>(null);

  // For debugging
  useEffect(() => {
    console.log("Form State Updated:", state);
  }, [state]);

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // setGeneratedHTML(`<!DOCTYPE html>
  //   <html lang="en">
  //     <head>
  //       <meta charset="UTF-8" />
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  //       <title>Test Preview</title>
  //       <style>
  //         body {
  //           margin: 0;
  //           padding: 2rem;
  //           background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  //           color: white;
  //           font-family: 'Inter', sans-serif;
  //           display: flex;
  //           flex-direction: column;
  //           align-items: center;
  //           justify-content: center;
  //           height: 100vh;
  //         }
  //         h1 {
  //           font-size: 2.5rem;
  //           color: #76ED9F;
  //           margin-bottom: 0.5rem;
  //         }
  //         p {
  //           font-size: 1.2rem;
  //           opacity: 0.8;
  //         }
  //         button {
  //           margin-top: 2rem;
  //           background: #76ED9F;
  //           color: #0f2027;
  //           border: none;
  //           padding: 0.8rem 1.5rem;
  //           font-size: 1rem;
  //           border-radius: 8px;
  //           cursor: pointer;
  //           transition: all 0.3s ease;
  //         }
  //         button:hover {
  //           transform: scale(1.05);
  //           background: #5dd98c;
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <h1>Bit2Byte Preview Test 🚀</h1>
  //       <p>This is a live HTML preview running inside your React app.</p>
  //       <button onclick="alert('This works!')">Click Me</button>
  //     </body>
  //   </html>`)

  /**
   * @brief Calls backend to generate html/css code by calling openAi API
   * @note Currently simulates API call with timeout
   */
  const handleGenerate = async () => {
    setIsLoading(true);
    
    // TODO: Replace with actual API call
    try{
      const response: Response = await fetch("http://localhost:8080/api/generate", {
          method: "POST", // Sending data to backend
          headers: {"Content-Type": "application/json"}, // Sendin JSON
          body: JSON.stringify(state) // Send form state as JSON
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // The backend returns a JSON like:
      // { "html": "<!DOCTYPE html>...</html>" }
      // parse the json response
      const data: { html: string } = await response.json();
      console.log("✅ Backend JSON response:", data);

      setGeneratedHTML(data.html);
      setShowPreview(true);

    } catch (error) {
      console.error("Error generating website:", error);
    } finally {
      setIsLoading(false);
    }
    // const html: string = `<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Randy Pahang - Portfolio</title> <style> body { margin: 0; font-family: 'San Francisco', sans-serif; background: linear-gradient(135deg, #ece9e6, #ffffff); overflow-x: hidden; } header { position: fixed; width: 100%; background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(10px); display: flex; justify-content: space-between; padding: 10px 40px; box-shadow: 0 1px 10px rgba(0, 0, 0, 0.1); z-index: 1000; } header a { color: #333; text-decoration: none; margin: 0 15px; position: relative; transition: color 0.3s ease; } header a:hover { color: #000; } header a::after { content: ''; position: absolute; left: 0; bottom: -2px; width: 100%; height: 2px; background: #000; transform: scaleX(0); transition: transform 0.3s ease; } header a:hover::after { transform: scaleX(1); } .hero { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: url('hero-bg.jpg') no-repeat center center/cover; color: white; position: relative; } .hero h1 { font-size: 4rem; margin: 0; animation: fadeIn 2s ease-out; } .hero h2 { font-size: 1.5rem; margin-top: 10px; animation: fadeIn 3s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .section { padding: 80px 20px; position: relative; } .about, .skills, .contact, .personal { max-width: 800px; margin: auto; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border-radius: 10px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); padding: 20px; transform: translateY(50px); opacity: 0; animation: slideUp 1s ease-out forwards; } @keyframes slideUp { to { transform: translateY(0); opacity: 1; } } .about h3, .skills h3, .contact h3, .personal h3 { margin-bottom: 20px; font-size: 2rem; } .skills ul { display: flex; flex-wrap: wrap; justify-content: center; list-style: none; padding: 0; } .skills li { background: linear-gradient(135deg, #ece9e6, #ffffff); padding: 10px 20px; margin: 10px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; } .skills li:hover { transform: translateY(-10px); box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1); } .contact a { display: inline-block; margin: 10px; text-decoration: none; color: #333; font-size: 1.5rem; transition: color 0.3s ease, transform 0.3s ease; } .contact a:hover { color: #000; transform: scale(1.1); } footer { text-align: center; padding: 20px; background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(5px); } </style> </head> <body> <header> <nav> <a href="#home">Home</a> <a href="#about">About</a> <a href="#skills">Skills</a> <a href="#contact">Contact</a> <a href="#personal">Personal</a> </nav> </header> <section class="hero" id="home"> <h1>Randy Pahang</h1> <h2>Full-stack Developer, Team Leader</h2> </section> <section class="section about" id="about"> <h3>About Me</h3> <p>I am a compute science major in my third year. For the past 3 years I have upheld a 4.0 GPA. I aspire to be a software engineer, and have had an internship at NVHD where I created websites for local churches.</p> </section> <section class="section skills" id="skills"> <h3>Skills</h3> <ul> <li>React</li> <li>Typescript</li> <li>Tailwindcss</li> <li>SpringBoot</li> <li>Django</li> <li>Python</li> <li>C++</li> <li>C#</li> <li>Java</li> <li>Node.js</li> <li>Next.Js</li> <li>Docker</li> <li>AWS</li> <li>Postgresql</li> </ul> </section> <section class="section contact" id="contact"> <h3>Contact</h3> <a href="mailto:rpahang2@gmail.com">Email</a> <a href="https://github.com/randyp2">GitHub</a> <a href="https://linkedin.com/in/randyp">LinkedIn</a> </section> <section class="section personal" id="personal"> <h3>Personal</h3> <p>I like to play basketball</p> <p>I code machine learning</p> <p>I rock climb in my free time</p> </section> <footer> <p>&copy; 2023 Randy Pahang</p> </footer> </body> </html>`;
    // setGeneratedHTML(html);
    // setShowPreview(true);
    // setIsLoading(false);
    
   
  };


  // For debugging - Test backend connection 
  const handlePing = async () => {
    try {
      const response: Response = await fetch("http://localhost:8080/api/generate/ping"); 
      const text: string = await response.text();
      console.log("Ping response:", text);
      alert(text);
    } catch (error) {
      console.error("Error connecting to backend:", error);
    alert("Failed to connect to backend!");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-linear-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-3">
            Portfolio Generator
          </h1>
          <p className="text-gray-400 text-lg">Create your portfolio in minutes</p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <FormContainer state={state} dispatch={dispatch} onGenerate={handleGenerate} isLoading={isLoading} />

          {/* Right Panel: Preview */}
          <PreviewContainer
            formData={state}
            showPreview={showPreview}
            isLoading={isLoading}
            generatedHTML={generatedHTML ?? ""}
          />

        </div>

      </div>
    </div>
    
  );
}

export default App
