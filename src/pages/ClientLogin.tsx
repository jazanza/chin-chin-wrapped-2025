"use client";

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDb } from "@/hooks/useDb";
// import { showError } from "@/utils/toast"; // Removed import

interface Customer {
  Id: number;
  Name: string;
  PhoneNumber: string | null;
  TaxNumber: string | null; // Assuming TaxNumber for RFC
  Email: string | null;
}

interface KBAQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  fieldType: 'PhoneNumber' | 'TaxNumber' | 'Email';
}

const MAX_KBA_ATTEMPTS = 2; // Changed from 3 to 2

// Helper to shuffle an array
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper to generate a fake phone number, guaranteed to be different from realPhone
const generateFakePhoneNumber = (realPhone: string): string => {
  if (!realPhone || realPhone.length === 0) return "0000000000";
  let fakePhone = realPhone;
  let attempts = 0;
  // Try to change a digit at a random position, ensuring it's different
  while (fakePhone === realPhone && attempts < 10) {
    const indexToChange = Math.floor(Math.random() * realPhone.length);
    const originalDigit = parseInt(realPhone[indexToChange], 10);
    let newDigit = ((originalDigit + 1 + Math.floor(Math.random() * 8)) % 10).toString(); // Change by 1-9
    
    // Ensure newDigit is different from originalDigit
    if (newDigit === originalDigit.toString()) {
      newDigit = ((originalDigit + 2) % 10).toString(); // Try changing by 2
    }

    fakePhone = realPhone.substring(0, indexToChange) + newDigit + realPhone.substring(indexToChange + 1);
    attempts++;
  }
  return fakePhone;
};

// Helper to generate a fake email, guaranteed to be different from realEmail
const generateFakeEmail = (realEmail: string): string => {
  if (!realEmail || realEmail.indexOf('@') === -1) return "fake@example.com";
  let fakeEmail = realEmail;
  let attempts = 0;
  while (fakeEmail === realEmail && attempts < 10) {
    const [name, domain] = realEmail.split('@');
    if (name.length === 0) return `x@${domain}`; // Fallback for very short names

    const indexToChange = Math.floor(Math.random() * name.length);
    const originalChar = name[indexToChange];
    let newChar = originalChar;

    if (/[a-zA-Z]/.test(originalChar)) {
      const baseCharCode = originalChar.toLowerCase() === originalChar ? 97 : 65; // 'a' or 'A'
      newChar = String.fromCharCode(((originalChar.charCodeAt(0) - baseCharCode + 1 + Math.floor(Math.random() * 24)) % 26) + baseCharCode);
    } else if (/[0-9]/.test(originalChar)) {
      newChar = ((parseInt(originalChar, 10) + 1 + Math.floor(Math.random() * 8)) % 10).toString();
    } else {
      newChar = String.fromCharCode(originalChar.charCodeAt(0) + 1);
    }
    
    if (newChar === originalChar) {
        newChar = String.fromCharCode(originalChar.charCodeAt(0) + 2);
    }

    fakeEmail = `${name.substring(0, indexToChange)}${newChar}${name.substring(indexToChange + 1)}@${domain}`;
    attempts++;
  }
  return fakeEmail;
};

// Helper to generate a fake TaxNumber (RFC), guaranteed to be different from realTaxNumber
const generateFakeTaxNumber = (realTaxNumber: string): string => {
  if (!realTaxNumber || realTaxNumber.length === 0) return "XXXX000000XXX";
  let fakeTaxNumber = realTaxNumber;
  let attempts = 0;
  while (fakeTaxNumber === realTaxNumber && attempts < 10) {
    const indexToChange = Math.floor(Math.random() * realTaxNumber.length);
    const originalChar = realTaxNumber[indexToChange];
    let newChar = originalChar;

    if (/[A-Z]/.test(originalChar)) {
      newChar = String.fromCharCode(((originalChar.charCodeAt(0) - 65 + 1 + Math.floor(Math.random() * 24)) % 26) + 65);
    } else if (/[0-9]/.test(originalChar)) {
      newChar = ((parseInt(originalChar, 10) + 1 + Math.floor(Math.random() * 8)) % 10).toString();
    } else {
      newChar = String.fromCharCode(originalChar.charCodeAt(0) + 1);
    }

    if (newChar === originalChar) {
        newChar = String.fromCharCode(originalChar.charCodeAt(0) + 2);
    }

    fakeTaxNumber = realTaxNumber.substring(0, indexToChange) + newChar + realTaxNumber.substring(indexToChange + 1);
    attempts++;
  }
  return fakeTaxNumber;
};


const ClientLogin = () => {
  const [step, setStep] = useState<"search" | "select" | "kba">("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [kbaQuestion, setKbaQuestion] = useState<KBAQuestion | null>(null);
  const [kbaAttempts, setKbaAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { findCustomer, dbLoaded } = useDb();

  const generateKBAQuestion = useCallback((customer: Customer): KBAQuestion | null => {
    const availableFields: { type: KBAQuestion['fieldType'], value: string }[] = [];
    if (customer.PhoneNumber) availableFields.push({ type: 'PhoneNumber', value: customer.PhoneNumber });
    if (customer.TaxNumber) availableFields.push({ type: 'TaxNumber', value: customer.TaxNumber });
    if (customer.Email) availableFields.push({ type: 'Email', value: customer.Email });

    if (availableFields.length === 0) {
      // showError("No hay datos de verificación (KBA) disponibles para este cliente."); // Removed toast
      return null;
    }

    const chosenField = availableFields[Math.floor(Math.random() * availableFields.length)];
    const correctAnswer = chosenField.value;
    let questionText = "";
    let fakeOption1 = "";
    let fakeOption2 = "";

    switch (chosenField.type) {
      case 'PhoneNumber':
        questionText = "¿Cuál de estos es tu número de teléfono registrado?";
        fakeOption1 = generateFakePhoneNumber(correctAnswer);
        do {
          fakeOption2 = generateFakePhoneNumber(correctAnswer);
        } while (fakeOption2 === correctAnswer || fakeOption2 === fakeOption1);
        break;
      case 'TaxNumber':
        questionText = "¿Cuál es el número de tu Cédula o RUC?";
        fakeOption1 = generateFakeTaxNumber(correctAnswer);
        do {
          fakeOption2 = generateFakeTaxNumber(correctAnswer);
        } while (fakeOption2 === correctAnswer || fakeOption2 === fakeOption1);
        break;
      case 'Email':
        questionText = "¿Cuál de estos es tu correo electrónico?";
        fakeOption1 = generateFakeEmail(correctAnswer);
        do {
          fakeOption2 = generateFakeEmail(correctAnswer);
        } while (fakeOption2 === correctAnswer || fakeOption2 === fakeOption1);
        break;
    }
    
    const options = shuffleArray([correctAnswer, fakeOption1, fakeOption2]);

    return {
      question: questionText,
      options,
      correctAnswer,
      fieldType: chosenField.type,
    };
  }, []);

  const handleSearch = async () => {
    if (!dbLoaded) {
      // showError("Base de datos no cargada. Por favor, espera."); // Removed toast
      console.error("Attempted search before database was loaded.");
      return;
    }
    setLoading(true);
    try {
      const results = await findCustomer(searchTerm);
      if (results && results.length === 1) { // Exact match, skip selection screen
        const customer = results[0];
        setSelectedCustomer(customer);
        const kba = generateKBAQuestion(customer);
        if (kba) {
          setKbaQuestion(kba);
          setKbaAttempts(0); // Reset KBA attempts for new flow
          setStep("kba");
        }
      } else if (results && results.length > 1) { // Multiple matches, go to selection screen
        setSearchResults(results);
        setStep("select");
      } else { // No matches
        // showError("No encontramos coincidencias. Intenta otro nombre o número."); // Removed toast
      }
    } catch (error: any) {
      console.error("Error searching for customer:", error);
      // showError(error.message || "Ocurrió un error al buscar."); // Removed toast
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelection = (customerId: string) => {
    const customer = searchResults.find((c) => c.Id.toString() === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      const kba = generateKBAQuestion(customer);
      if (kba) {
        setKbaQuestion(kba);
        setKbaAttempts(0); // Reset KBA attempts for new flow
        setStep("kba");
      }
    }
  };

  const handleKbaAnswer = (selectedOption: string) => {
    if (!kbaQuestion || !selectedCustomer) return;

    if (selectedOption === kbaQuestion.correctAnswer) {
      navigate(`/wrapped/${selectedCustomer.Id}`); // Navigate immediately on correct answer
    } else {
      const newAttempts = kbaAttempts + 1;
      setKbaAttempts(newAttempts);
      if (newAttempts >= MAX_KBA_ATTEMPTS) {
        // showError("Has agotado tus intentos de verificación. Vuelve a empezar."); // Removed toast
        handleBackToSearch(); // Go back to search on too many failed attempts
      } else {
        // showError(`Respuesta incorrecta. Intentos restantes: ${MAX_KBA_ATTEMPTS - newAttempts}`); // Removed toast
      }
    }
  };

  const handleBackToSearch = () => {
    setStep("search");
    setSearchTerm("");
    setSearchResults([]);
    setSelectedCustomer(null);
    setKbaQuestion(null);
    setKbaAttempts(0);
  };

  const handleBackToSelect = () => {
    setStep("select");
    setSelectedCustomer(null);
    setKbaQuestion(null);
    setKbaAttempts(0);
  };

  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-sans">
      <div className="text-center max-w-md w-full">
        {/* Logo de la empresa */}
        <img
          src="/Logo.png"
          alt="Logo Chin Chin"
          className="mx-auto w-32 h-auto mb-8" // Centrado, tamaño y margen inferior
        />
        <h1 
          className="text-6xl font-bold mb-8 uppercase tracking-widest" // H1
        >
          CHIN CHIN WRAPPED 2025
        </h1>
        <p 
          className="text-xl mb-8 uppercase tracking-wide" // H3
        >
          Descubre tu año cervecero.
        </p>

        {step === "search" && (
          <div className="space-y-4">
            <Label htmlFor="customer-search" className="sr-only">
              Buscar por Nombre o Teléfono
            </Label>
            <Input
              id="customer-search"
              type="text"
              placeholder="Tu nombre, apellido o cédula"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // Brutalist Input: Black background, White text, White border, no rounded corners
              className="bg-black border-white text-white placeholder-gray-500 focus:ring-white focus:border-white border-2 rounded-none"
              disabled={loading || !dbLoaded}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button
              onClick={handleSearch}
              size="lg"
              // Brutalist Button: White background, Black text, Black border, no rounded corners, simple hover inverse
              className="w-full bg-white text-black font-bold py-3 px-6 border-2 border-black rounded-none transition-none hover:bg-black hover:text-white hover:border-white"
              disabled={loading || !dbLoaded}
            >
              {loading ? "Buscando..." : "Siguiente"}
            </Button>
          </div>
        )}

        {step === "select" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-4"> {/* H4 */}
              ¿Quién eres?
            </h2>
            <RadioGroup
              onValueChange={handleCustomerSelection}
              className="flex flex-col space-y-2 p-4 border-2 border-white" // Brutalist container
            >
              {searchResults.map((customer) => (
                <div key={customer.Id} className="flex items-center space-x-2">
                  <RadioGroupItem value={customer.Id.toString()} id={`customer-${customer.Id}`} className="border-white text-white focus:ring-white" />
                  <Label htmlFor={`customer-${customer.Id}`} className="text-base cursor-pointer"> {/* H4 */}
                    {customer.Name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {/* Removed redundant 'Continuar' button, selection handles navigation */}
            <Button
              onClick={handleBackToSearch}
              variant="ghost"
              // Brutalist Ghost Button: Black background, White text, White border on hover
              className="w-full text-white border-2 border-transparent hover:border-white hover:bg-black rounded-none"
            >
              Volver a buscar
            </Button>
          </div>
        )}

        {step === "kba" && selectedCustomer && kbaQuestion && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-4"> {/* H4 */}
              Verifica tu identidad
            </h2>
            <p className="text-base text-white mb-4 border-2 border-white p-2"> {/* H4 */}
              {kbaQuestion.question}
            </p>
            <RadioGroup
              onValueChange={handleKbaAnswer}
              className="flex flex-col space-y-2 p-4 border-2 border-white" // Brutalist container
            >
              {kbaQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`kba-option-${index}`} className="border-white text-white focus:ring-white" />
                  <Label htmlFor={`kba-option-${index}`} className="text-base cursor-pointer"> {/* H4 */}
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <p className="text-sm text-gray-400 mt-2"> {/* Cuerpo */}
              Intentos restantes: {MAX_KBA_ATTEMPTS - kbaAttempts}
            </p>
            <Button
              onClick={handleBackToSelect}
              variant="ghost"
              className="w-full text-white border-2 border-transparent hover:border-white hover:bg-black rounded-none"
            >
              Volver a la selección
            </Button>
            <Button
              onClick={handleBackToSearch}
              variant="ghost"
              className="w-full text-white border-2 border-transparent hover:border-white hover:bg-black rounded-none"
            >
              Reiniciar búsqueda
            </Button>
          </div>
        )}

        {/* H4 */}
        {!dbLoaded && step === "search" && (
          <p className="mt-4 text-base text-white border-2 border-white p-2">Cargando base de datos...</p>
        )}
      </div>
    </div>
  );
};

export default ClientLogin;