"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setDataset, clearDataset } from "../store";
import type { ChangeEvent } from "react";

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id, columns } = useAppSelector((state) => state.dataset);

  // Estado local para manejar el File antes de subirlo
  const [file, setFile] = useState<File | null>(null);

  // Maneja el cambio en el input de tipo file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Llama a la API en Python para subir el archivo y obtener columnas
  const handleUpload = async () => {
    if (!file) return;

    try {
      // Ejemplo de llamada al backend (ajusta la URL según tu API)
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Error subiendo el archivo");
      }

      // Suponiendo que el backend retorna { datasetId, columns }
      const data = await res.json();
      dispatch(
        setDataset({
          id: data.datasetId,
          columns: data.columns,
          file, // Guardamos el File también en Redux si lo necesitas
        })
      );
    } catch (error) {
      console.error(error);
      alert("Hubo un error subiendo el dataset.");
    }
  };

  // Botón "Continuar" -> va a la pantalla /select-target
  const handleContinue = () => {
    if (!id) {
      alert("Primero debes subir un dataset.");
      return;
    }
    router.push("/select-target");
  };

  // Botón "Regresar" -> limpia el store y se queda en la misma página
  const handleBack = () => {
    dispatch(clearDataset());
    setFile(null);
  };

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Página de Bienvenido</h1>
      <p>Sube tu dataset para iniciar.</p>

      <div style={{ margin: "1rem 0" }}>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: "0.5rem" }}>
          Subir Dataset
        </button>
      </div>

      {/* Previsualización de columnas, solo si ya hay columnas en Redux */}
      {columns && columns.length > 0 && (
        <div>
          <h2>Previsualización de Columnas</h2>
          <ul>
            {columns.map((col) => (
              <li key={col}>{col}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleContinue} style={{ marginRight: "0.5rem" }}>
          Continuar
        </button>
        <button onClick={handleBack}>Regresar</button>
      </div>
    </main>
  );
}
