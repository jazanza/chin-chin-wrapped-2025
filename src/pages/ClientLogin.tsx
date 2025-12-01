"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup components
import { useDb } from "@/hooks/useDb";
import { showError } from "@/utils/toast";

interface Customer {
  Id: number;
  Name: string;
  PhoneNumber: string;
}

const ClientLogin = () => {
  const [step, setStep] = useState<"search" | "select" | "verify">("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [verificationPhone, setVerificationPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { findCustomer, verifyCustomer, dbLoaded } = useDb();

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

  const handleVerify = async () => {
    if (!selectedCustomer || !verificationPhone) {
      showError("Por favor, selecciona un cliente e ingresa tu número de teléfono.");
      return;
    }
    setLoading(true);
    try {
      const isVerified = await verifyCustomer(selectedCustomer.Id, verificationPhone);
      if (isVerified) {
        navigate(`/wrapped/${selectedCustomer.Id}`);
      } else {
        showError("Número de teléfono incorrecto. Por favor, inténtalo de nuevo.");
      }
    } catch (error: any) {
      console.error("Error verifying customer:", error);
      showError(error.message || "Ocurrió un error durante la verificación.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setStep("search");
    setSearchResults([]);
    setSelectedCustomer(null);
    setVerificationPhone("");
  };

  const handleBackToSelect = () => {
    setStep("select");
    setSelectedCustomer(null);
    setVerificationPhone("");
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
              placeholder="Tu nombre o número de teléfono"
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
              onValueChange={(value) => {
                const customer = searchResults.find((c) => c.Id.toString() === value);
                if (customer) {
                  setSelectedCustomer(customer);
                }
              }}
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
              onClick={() => setStep("verify")}
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

        {step === "verify" && selectedCustomer && (
          <div className="space-y-4">
            <h2 className="text-[min(5vw,2rem)] font-bold text-white mb-4">
              Verifica tu identidad
            </h2>
            <p className="text-lg text-secondary-glitch-cyan mb-4">
              Ingresa el número de teléfono asociado a {selectedCustomer.Name}:
            </p>
            <Input
              id="verification-phone"
              type="tel" // Use type="tel" for phone numbers
              placeholder="Tu número de teléfono"
              value={verificationPhone}
              onChange={(e) => setVerificationPhone(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-primary-glitch-pink focus:border-primary-glitch-pink"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleVerify();
                }
              }}
            />
            <Button
              onClick={handleVerify}
              size="lg"
              className="w-full bg-button-highlight hover:bg-button-highlight/80 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              disabled={loading || !verificationPhone}
            >
              {loading ? "Verificando..." : "Ver mi Wrapped"}
            </Button>
            <Button
              onClick={handleBackToSelect}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              Volver a la selección
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