/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Dog, Checkin } from './types';
import {
  fetchAllDogs,
  fetchCheckinsByDate,
  createCheckin,
  performCheckout,
  createDog,
  updateDog,
  deleteDog,
  updateCheckin,
  deleteCheckin,
  getTodayDateString,
  getCurrentTimeString,
} from './lib/dataService';
import { getSupabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DailyPanel } from './components/DailyPanel';
import { DogDirectory } from './components/DogDirectory';
import { HistoryView } from './components/HistoryView';
import { CheckoutModal } from './components/CheckoutModal';
import { DailyNotesModal } from './components/DailyNotesModal';
import { DogModal } from './components/DogModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Check, Info } from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'painel' | 'caes' | 'historico'>('painel');
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [todayCheckins, setTodayCheckins] = useState<Checkin[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [historyCheckins, setHistoryCheckins] = useState<Checkin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDogModalOpen, setIsDogModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [checkoutData, setCheckoutData] = useState<{ dog: Dog; checkin: Checkin } | null>(null);
  const [notesData, setNotesData] = useState<{ dog: Dog; checkin: Checkin } | null>(null);

  // Toast feedback for fast touch operations
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Load dogs and checkins
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = getTodayDateString();
      const [allDogs, todayChks] = await Promise.all([
        fetchAllDogs(),
        fetchCheckinsByDate(today),
      ]);
      setDogs(allDogs);
      setTodayCheckins(todayChks);

      // If viewing history for a different date, load that date as well
      if (selectedDate !== today) {
        const hist = await fetchCheckinsByDate(selectedDate);
        setHistoryCheckins(hist);
      } else {
        setHistoryCheckins(todayChks);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up Supabase Realtime subscription when connected
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'checkins' },
          () => {
            loadData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'dogs' },
          () => {
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Realtime subscription não disponível:', e);
    }
  }, [loadData]);

  // When date changes in history
  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    setIsLoading(true);
    try {
      const chks = await fetchCheckinsByDate(newDate);
      setHistoryCheckins(chks);
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Toque: Check-in
  const handleFastCheckin = async (dogId: string) => {
    const dog = dogs.find((d) => d.id === dogId);
    const nowTime = getCurrentTimeString().substring(0, 5);
    try {
      const newChk = await createCheckin(dogId);
      setTodayCheckins((prev) => [newChk, ...prev.filter((c) => c.dog_id !== dogId)]);
      if (selectedDate === getTodayDateString()) {
        setHistoryCheckins((prev) => [newChk, ...prev.filter((c) => c.dog_id !== dogId)]);
      }
      showToast(`🐾 ${dog?.nome || 'Cão'}: Entrada confirmada às ${nowTime}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no check-in';
      showToast(`Erro: ${msg}`);
    }
  };

  // 1-Toque: Check-out
  const handleConfirmCheckout = async (checkinId: string, horaSaida: string, observacaoDia: string) => {
    try {
      const updated = await performCheckout(checkinId, horaSaida, observacaoDia);
      setTodayCheckins((prev) => prev.map((c) => (c.id === checkinId ? updated : c)));
      setHistoryCheckins((prev) => prev.map((c) => (c.id === checkinId ? updated : c)));
      showToast(`🏁 Check-out registrado com sucesso!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no check-out';
      showToast(`Erro: ${msg}`);
    }
  };

  // Salvar nota do dia
  const handleSaveNotes = async (checkinId: string, observacaoDia: string) => {
    try {
      const updated = await updateCheckin(checkinId, { observacao_dia: observacaoDia });
      setTodayCheckins((prev) => prev.map((c) => (c.id === checkinId ? updated : c)));
      setHistoryCheckins((prev) => prev.map((c) => (c.id === checkinId ? updated : c)));
      showToast(`📝 Nota do dia atualizada!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar nota';
      showToast(`Erro: ${msg}`);
    }
  };

  // Salvar ou atualizar cão
  const handleSaveDog = async (dogData: Omit<Dog, 'id' | 'created_at'>, id?: string) => {
    if (id) {
      const updated = await updateDog(id, dogData);
      setDogs((prev) => prev.map((d) => (d.id === id ? updated : d)));
      showToast(`Cão ${updated.nome} atualizado!`);
    } else {
      const created = await createDog(dogData);
      setDogs((prev) => [created, ...prev]);
      showToast(`🐾 Novo cão ${created.nome} cadastrado!`);
    }
    loadData();
  };

  // Deletar cão
  const handleDeleteDog = async (id: string) => {
    await deleteDog(id);
    setDogs((prev) => prev.filter((d) => d.id !== id));
    showToast(`Cadastro removido.`);
    loadData();
  };

  // Deletar check-in
  const handleDeleteCheckin = async (checkinId: string) => {
    await deleteCheckin(checkinId);
    setTodayCheckins((prev) => prev.filter((c) => c.id !== checkinId));
    setHistoryCheckins((prev) => prev.filter((c) => c.id !== checkinId));
    showToast(`Registro de presença excluído.`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased selection:bg-[#fffe42] selection:text-[#142e53]">
      {/* Top Header */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewDog={() => {
          setEditingDog(null);
          setIsDogModalOpen(true);
        }}
        activeScreen={activeScreen}
      />

      {/* Main Content Area (Mobile Optimized with Bottom Nav Clearance) */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-5 pb-24 sm:pb-28">
        {activeScreen === 'painel' && (
          <DailyPanel
            dogs={dogs}
            todayCheckins={todayCheckins}
            selectedDate={selectedDate}
            isToday={selectedDate === getTodayDateString()}
            isLoading={isLoading}
            onCheckinClick={handleFastCheckin}
            onCheckoutClick={(dog, checkin) => setCheckoutData({ dog, checkin })}
            onEditNotesClick={(dog, checkin) => setNotesData({ dog, checkin })}
            onNewDogClick={() => {
              setEditingDog(null);
              setIsDogModalOpen(true);
            }}
            onRefresh={loadData}
          />
        )}

        {activeScreen === 'caes' && (
          <DogDirectory
            dogs={dogs}
            onNewDogClick={() => {
              setEditingDog(null);
              setIsDogModalOpen(true);
            }}
            onEditDogClick={(dog) => {
              setEditingDog(dog);
              setIsDogModalOpen(true);
            }}
          />
        )}

        {activeScreen === 'historico' && (
          <HistoryView
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            checkins={historyCheckins}
            dogs={dogs}
            isLoading={isLoading}
            onEditCheckin={(dog, checkin) => setCheckoutData({ dog, checkin })}
            onDeleteCheckin={handleDeleteCheckin}
          />
        )}
      </main>

      {/* Bottom Mobile Navigation Bar */}
      <BottomNav
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeDogsCount={dogs.filter((d) => d.ativo).length}
      />

      {/* Offline Connectivity Toast Indicator */}
      <OfflineIndicator />

      {/* Fast Feedback Toast Banner */}
      {toastMessage && (
        <aside
          aria-label="Notificações do sistema"
          className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md flex items-center justify-between gap-2 rounded-2xl bg-[#142e53] text-[#fffe42] px-4 py-3 text-xs sm:text-sm font-extrabold shadow-2xl border border-[#fffe42]/30 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 stroke-[3] text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white p-1 text-xs"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Modals */}
      {checkoutData && (
        <CheckoutModal
          isOpen={true}
          dog={checkoutData.dog}
          checkin={checkoutData.checkin}
          onClose={() => setCheckoutData(null)}
          onConfirm={handleConfirmCheckout}
        />
      )}

      {notesData && (
        <DailyNotesModal
          isOpen={true}
          dog={notesData.dog}
          checkin={notesData.checkin}
          onClose={() => setNotesData(null)}
          onSave={handleSaveNotes}
        />
      )}

      {isDogModalOpen && (
        <DogModal
          isOpen={true}
          dogToEdit={editingDog}
          onClose={() => {
            setIsDogModalOpen(false);
            setEditingDog(null);
          }}
          onSave={handleSaveDog}
          onDelete={handleDeleteDog}
        />
      )}

      {isSettingsOpen && (
        <SupabaseSettingsModal
          isOpen={true}
          onClose={() => setIsSettingsOpen(false)}
          onConfigChanged={loadData}
        />
      )}
    </div>
  );
}
