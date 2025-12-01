"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDb } from "@/hooks/useDb";
import { showError } from "@/utils/toast";

const ClientLogin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { findCustomer, dbLoaded } = useDb(); // Use dbLoaded to check if DB is ready

  const handleSearch = async () => {
    if (!dbLoaded) {
      showError("Database not loaded yet. Please wait.");
      return;
    }
    setLoading(true);
    try {
      const customer = await findCustomer(searchTerm);
      if (customer) {
        navigate(`/wrapped/${customer.Id}`);
      } else {
        showError("Datos no encontrados. Intenta con otro nombre o número.");
      }
    } catch (error) {
      console.error("Error searching for customer:", error);
      showError("Ocurrió un error al buscar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-[min(8vw,4rem)] font-bold mb-8 text-[var(--primary-glitch-pink)]"
            style={{ textShadow: "3px 3px var(--secondary-glitch-cyan)" }}>
          Chin Chin 2025 Wrapped
        </h1>
        <p className="text-[min(4vw,1.5rem)] mb-8 text-[var(--secondary-glitch-cyan)]">
          Descubre tu año cervecero.
        </p>
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
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-[var(--primary-glitch-pink)] focus:border-[var(--primary-glitch-pink)]"
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
            className="w-full bg-[var(--primary-glitch-pink)] hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            disabled={loading || !dbLoaded}
          >
            {loading ? "Buscando..." : "Ver mi Wrapped"}
          </Button>
        </div>
        {!dbLoaded && (
          <p className="mt-4 text-gray-400 text-sm">Cargando base de datos...</p>
        )}
      </div>
    </div>
  );
};

export default ClientLogin;