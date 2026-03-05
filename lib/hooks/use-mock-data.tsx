"use client";

import { useState, useEffect, useCallback } from "react";
import {
  initializeMockData,
  getMockBeneficiarios,
  getMockAsignaciones,
  getMockBitacoras,
  getMockNotificaciones,
  getMockUsuarios,
  addMockBeneficiario,
  addMockAsignacion,
  isMockDataInitialized,
  type MockBeneficiario,
  type MockAsignacion,
  type MockBitacora,
  type MockNotificacion,
  type MockUsuario,
} from "@/lib/mock-data";

interface UseMockDataOptions {
  autoInitialize?: boolean;
}

interface BeneficiariosFilters {
  search?: string;
  municipio?: string;
  cadena?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Hook para usar datos simulados en el cliente
 * Debe usarse en componentes cliente ("use client")
 */
export function useMockData(options: UseMockDataOptions = {}) {
  const { autoInitialize = true } = options;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (autoInitialize && typeof window !== "undefined") {
      initializeMockData();
    }
    setIsReady(true);
  }, [autoInitialize]);

  return { isReady };
}

/**
 * Hook para obtener beneficiarios con filtros y paginación
 */
export function useMockBeneficiarios(
  page: number = 1,
  limit: number = 20,
  filters: BeneficiariosFilters = {}
) {
  const [result, setResult] = useState<PaginatedResult<MockBeneficiario>>({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    
    const allData = getMockBeneficiarios();
    let filtered = [...allData];

    // Aplicar filtros
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.nombre_completo.toLowerCase().includes(search) ||
          b.folio_saderh?.toLowerCase().includes(search) ||
          b.curp?.toLowerCase().includes(search)
      );
    }

    if (filters.municipio) {
      filtered = filtered.filter((b) =>
        b.municipio.toLowerCase().includes(filters.municipio!.toLowerCase())
      );
    }

    if (filters.cadena) {
      filtered = filtered.filter((b) => b.cadena_productiva === filters.cadena);
    }

    // Ordenar por fecha de registro (más reciente primero)
    filtered.sort(
      (a, b) =>
        new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
    );

    // Paginación
    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginatedData = filtered.slice(offset, offset + limit);

    setResult({
      data: paginatedData,
      total,
      page,
      limit,
    });
    setLoading(false);
  }, [page, limit, filters.search, filters.municipio, filters.cadena]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadData();
    }
  }, [loadData]);

  return { ...result, loading, refetch: loadData };
}

/**
 * Hook para obtener asignaciones con filtros
 */
export function useMockAsignaciones(
  page: number = 1,
  limit: number = 20,
  filters: { id_tecnico?: number; completado?: boolean } = {}
) {
  const [result, setResult] = useState<PaginatedResult<MockAsignacion>>({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);

    const allData = getMockAsignaciones();
    let filtered = [...allData];

    if (filters.id_tecnico) {
      filtered = filtered.filter((a) => a.id_tecnico === filters.id_tecnico);
    }

    if (filters.completado !== undefined) {
      filtered = filtered.filter((a) => a.completado === filters.completado);
    }

    // Ordenar por fecha de creación (más reciente primero)
    filtered.sort(
      (a, b) =>
        new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    );

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginatedData = filtered.slice(offset, offset + limit);

    setResult({
      data: paginatedData,
      total,
      page,
      limit,
    });
    setLoading(false);
  }, [page, limit, filters.id_tecnico, filters.completado]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadData();
    }
  }, [loadData]);

  return { ...result, loading, refetch: loadData };
}

/**
 * Hook para obtener bitácoras
 */
export function useMockBitacoras(
  page: number = 1,
  limit: number = 20,
  filters: { id_tecnico?: number } = {}
) {
  const [result, setResult] = useState<PaginatedResult<MockBitacora>>({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);

    const allData = getMockBitacoras();
    let filtered = [...allData];

    if (filters.id_tecnico) {
      filtered = filtered.filter((b) => b.id_usuario === filters.id_tecnico);
    }

    // Ordenar por fecha (más reciente primero)
    filtered.sort(
      (a, b) =>
        new Date(b.fecha_hora_inicio).getTime() - new Date(a.fecha_hora_inicio).getTime()
    );

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginatedData = filtered.slice(offset, offset + limit);

    setResult({
      data: paginatedData,
      total,
      page,
      limit,
    });
    setLoading(false);
  }, [page, limit, filters.id_tecnico]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadData();
    }
  }, [loadData]);

  return { ...result, loading, refetch: loadData };
}

/**
 * Hook para obtener notificaciones
 */
export function useMockNotificaciones(id_usuario?: number) {
  const [notificaciones, setNotificaciones] = useState<MockNotificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const data = getMockNotificaciones();
    let filtered = data;

    if (id_usuario !== undefined) {
      filtered = data.filter(
        (n) => n.id_usuario === id_usuario || n.id_usuario === null
      );
    }

    // Ordenar por fecha (más reciente primero)
    filtered.sort(
      (a, b) =>
        new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    );

    setNotificaciones(filtered);
    setLoading(false);
  }, [id_usuario]);

  return { notificaciones, loading };
}

/**
 * Hook para obtener técnicos
 */
export function useMockTecnicos() {
  const [tecnicos, setTecnicos] = useState<MockUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const usuarios = getMockUsuarios();
    const tecnicosData = usuarios.filter((u) => u.rol === "TECNICO" && u.activo);
    setTecnicos(tecnicosData);
    setLoading(false);
  }, []);

  return { tecnicos, loading };
}

/**
 * Hook para agregar beneficiario
 */
export function useAddMockBeneficiario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (beneficiario: Omit<MockBeneficiario, "id_beneficiario">) => {
    setLoading(true);
    setError(null);

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));
      const nuevo = addMockBeneficiario(beneficiario);
      setLoading(false);
      return nuevo;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
      return null;
    }
  };

  return { add, loading, error };
}

/**
 * Hook para agregar asignación
 */
export function useAddMockAsignacion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (asignacion: Omit<MockAsignacion, "id_asignacion">) => {
    setLoading(true);
    setError(null);

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));
      const nueva = addMockAsignacion(asignacion);
      setLoading(false);
      return nueva;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
      return null;
    }
  };

  return { add, loading, error };
}

/**
 * Verifica si los datos mock están inicializados
 */
export function useIsMockDataReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReady(isMockDataInitialized());
    }
  }, []);

  return ready;
}
