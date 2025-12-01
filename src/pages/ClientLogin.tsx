"use client";

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDb } from "@/hooks/useDb";
import { showError } from "@/utils/toast";

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

const MAX_KBA_ATTEMPTS = 3;

// Helper to shuffle an array
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Helper to generate fake phone numbers
const generateFakePhoneNumber = (realPhone: string): string => {
  if (!realPhone || realPhone.length < 2) return "0000000000";
  const lastDigit = parseInt(realPhone[realPhone.length - 1], 10);
  const secondLastDigit = parseInt(realPhone[realPhone.length - 2], 10);

  let fake1 = realPhone.slice(0, -1) + ((lastDigit + 1) % 10).toString();
  let fake2 = realPhone.slice(0, -2) + ((secondLastDigit + 1) % 10).toString() + lastDigit.toString();

  // Ensure fakes are different from real and each other
  if (fake1 === realPhone) fake1 = realPhone.slice(0, -1) + ((lastDigit + 2) % 10).toString();
  if (fake2 === realPhone || fake2 === fake1) fake2 = realPhone.slice(0, -2) + ((secondLastDigit + 2) % 10).toString() + lastDigit.toString();
  
  return fake1; // Return one fake for now, will generate two in the KBA logic
};

// Helper to generate fake emails
const generateFakeEmail = (realEmail: string): string => {
  if (!realEmail || realEmail.indexOf('@') === -1) return "fake@example.com";
  const [name, domain] = realEmail.split('@');
  if (name.length < 2) return `x${name}@${domain}`;
  const charToChange = name[Math.floor(name.length / 2)];
  const newChar = String.fromCharCode(charToChange.charCodeAt(0) + 1);
  return `${name.slice(0, Math.floor(name.length / 2))}${newChar}${name.slice(Math.floor(name.length / 2) + 1)}@${domain}`;
};

// Helper to generate fake TaxNumber (RFC)
const generateFakeTaxNumber = (realTaxNumber: string): string => {
  if (!realTaxNumber || realTaxNumber.length < 2) return "XXXX000000XXX";
  const index = Math.floor(realTaxNumber.length / 2);
  const charToChange = realTaxNumber[index];
  let newChar = '';
  if (/[A-Z]/.test(charToChange)) {
    newChar = String.fromCharCode(((charToChange.charCodeAt(0) - 65 + 1) % 26) + 65);
  } else if (/[0-9]/.test(charToChange)) {
    newChar = ((parseInt(charToChange, 10) + 1) % 10).toString();
  } else {
    return realTaxNumber.slice(0, index) + 'X' + realTaxNumber.slice(index + 1);
  }
  return realTaxNumber.slice(0, index) + newChar + realTaxNumber.slice(index + 1);
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
      showError("No hay datos de verificación disponibles para este cliente.");
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
        fakeOption2 = generateFakePhoneNumber(correctAnswer + "x"); // Generate a slightly different fake
        break;
      case 'TaxNumber':
        questionText = "¿Cuál de estos es tu RFC/Número de Identificación Fiscal?";
        fakeOption1 = generateFakeTaxNumber(correctAnswer);
        fakeOption2 = generateFakeTaxNumber(correctAnswer + "x");
        break;
      case 'Email':
        questionText = "¿Cuál de estos es tu correo electrónico registrado?";
        fakeOption1 = generateFakeEmail(correctAnswer);
        fakeOption2 = generateFakeEmail(correctAnswer + "x");
        break;
    }
    
    // Ensure fake options are distinct from the correct answer and each other
    while (fakeOption1 === correctAnswer || fakeOption1 === fakeOption2) {
      fakeOption1 = generateFakePhoneNumber(correctAnswer + "y"); // Re-generate if not unique
    }
    while (fakeOption2 === correctAnswer || fakeOption2 === fakeOption1) {
      fakeOption2 = generateFakePhoneNumber(correctAnswer + "z"); // Re-generate if not unique
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
      showError("Database not loaded yet. Please wait.");
      console.error("Attempted search before database was loaded.");
      return;
    }
    setLoading(true);
    try {
      const results = await findCustomer(searchTerm);
      if (results && results.length > 0) {
        setSearchResults(results);
        setStep("select");
      } else {
        showError("No se encontraron coincidencias. Intenta con otro nombre o número.");
      }
    } catch (error: any) {
      console.error("Error searching for customer:", error);
      showError(error.message || "Ocurrió un error al buscar el cliente.");
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
        setKbaAttempts(0);
        setStep("kba");
      }
    }
  };

  const handleKbaAnswer = (selectedOption: string) => {
    if (!kbaQuestion || !selectedCustomer) return;

    if (selectedOption === kbaQuestion.correctAnswer) {
      navigate(`/wrapped/${selectedCustomer.Id}`);
    } else {
      setKbaAttempts((prev) => prev + 1);
      if (kbaAttempts + 1 >= MAX_KBA_ATTEMPTS) {
        showError("Demasiados intentos fallidos. Por favor, reinicia la búsqueda.");
        handleBackToSearch();
      } else {
        showError(`Respuesta incorrecta. Te quedan ${MAX_KBA_ATTEMPTS - (kbaAttempts + 1)} intentos.`);
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
        <h1 className="text-[min(8vw,4rem)] font-bold mb-8 text-primary-glitch-pink"
            style={{ textShadow: "3px 3px var(--secondary-glitch-cyan)" }}>
          Chin Chin 2025 Wrapped
        </h1>
        <p className="text-[min(4vw,1.5rem)] mb-8 text-secondary-glitch-cyan">
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
              placeholder="Tu nombre, teléfono, RFC o email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-primary-glitch-pink focus:border-primary-glitch-pink"
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
              className="w-full bg-button-highlight hover:bg-button-highlight/80 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              disabled={loading || !dbLoaded}
            >
              {loading ? "Buscando..." : "Buscar mi Wrapped"}
            </Button>
          </div>
        )}

        {step === "select" && (
          <div className="space-y-4">
            <h2 className="text-[min(5vw,2rem)] font-bold text-white mb-4">
              ¿Quién eres?
            </h2>
            <RadioGroup
              onValueChange={handleCustomerSelection}
              className="flex flex-col space-y-2"
            >
              {searchResults.map((customer) => (
                <div key={customer.Id} className="flex items-center space-x-2">
                  <RadioGroupItem value={customer.Id.toString()} id={`customer-${customer.Id}`} />
                  <Label htmlFor={`customer-${customer.Id}`} className="text-white text-lg cursor-pointer">
                    {customer.Name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={() => { /* This button is now handled by RadioGroup onValueChange */ }}
              size="lg"
              className="w-full bg-button-highlight hover:bg-button-highlight/80 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              disabled={!selectedCustomer || loading}
            >
              Continuar
            </Button>
            <Button
              onClick={handleBackToSearch}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              Volver a buscar
            </Button>
          </div>
        )}

        {step === "kba" && selectedCustomer && kbaQuestion && (
          <div className="space-y-4">
            <h2 className="text-[min(5vw,2rem)] font-bold text-white mb-4">
              Verifica tu identidad
            </h2>
            <p className="text-lg text-secondary-glitch-cyan mb-4">
              {kbaQuestion.question}
            </p>
            <RadioGroup
              onValueChange={handleKbaAnswer}
              className="flex flex-col space-y-2"
            >
              {kbaQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`kba-option-${index}`} />
                  <Label htmlFor={`kba-option-${index}`} className="text-white text-lg cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <p className="text-sm text-gray-400 mt-2">
              Intentos restantes: {MAX_KBA_ATTEMPTS - kbaAttempts}
            </p>
            <Button
              onClick={handleBackToSelect}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              Volver a la selección
            </Button>
            <Button
              onClick={handleBackToSearch}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              Reiniciar búsqueda
            </Button>
          </div>
        )}

        {!dbLoaded && (
          <p className="mt-4 text-gray-400 text-sm">Cargando base de datos...</p>
        )}
      </div>
    </div>
  );
};

export default ClientLogin;