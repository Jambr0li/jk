'use client';

import React, { useCallback, useMemo, useState } from 'react';
import HeroBanner from './HeroBanner';
import headshot from './headshot_small.png';
import { useChat } from '@ai-sdk/react';

// Pool of all possible button choices
const ALL_BUTTONS = [
  { label: 'What Are You Working On?', message: 'What Are You Working On?' },
  { label: 'What Are Your Hobbies?', message: 'What Are Your Hobbies?' },
  { label: 'What Is Fun Fact?', message: 'What Is Fun Fact?' },
  { label: 'Do You Have a Degree?', message: 'Do You Have a Degree?'},
  { label: 'What Jobs Have You Worked?', message: 'What Jobs Have You Worked?'},
];

export default function Chat() {
  // Render the hero banner at the top
  // (rest of Chat component follows)

  // Map from custom message (sent to AI) to original message (button label)
  const [customToOriginalMap, setCustomToOriginalMap] = useState<Record<string, string>>({});
  const { messages, append, isLoading } = useChat();
  const [clickedMessages, setClickedMessages] = useState<string[]>([]);
  const [initialButtons, setInitialButtons] = useState<typeof ALL_BUTTONS>([]);

  // On first mount, pick 4 random buttons for the initial state (client only)
  React.useEffect(() => {
    if (messages.length === 0 && initialButtons.length === 0) {
      // Only run this on the client
      const unused = ALL_BUTTONS.filter(btn => !clickedMessages.includes(btn.message)); // always the first 4 are showed initially
      setInitialButtons(unused.slice(0, 4));
    }
  }, [messages.length, initialButtons.length, clickedMessages]);

  // Helper to extract buttons from AI message parts (assumes JSON in text or a convention)
  function extractButtons(part: { type: string; text?: string }) {
    if (part.type === 'text' && typeof part.text === 'string') {
      try {
        const data = JSON.parse(part.text);
        if (Array.isArray(data.buttons)) {
          return { text: data.text, buttons: data.buttons };
        }
      } catch {}
    }
    return null;
  }

  // Track all messages that have been sent (to avoid showing their buttons again)
  const allClicked = useMemo(() => new Set(clickedMessages), [clickedMessages]);

  // Get the latest AI message with buttons (if any)
  const latestAIButtons = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant') {
        for (const part of msg.parts) {
          const btnObj = extractButtons(part);
          if (btnObj && Array.isArray(btnObj.buttons)) {
            // Filter out buttons that have already been clicked
            const filtered = btnObj.buttons.filter(
              (btn: { message: string }) => !allClicked.has(btn.message)
            );
            if (filtered.length > 0) {
              return { text: btnObj.text, buttons: filtered };
            }
          }
        }
      }
    }
    return null;
  }, [messages, allClicked]);

  // Pick 4 random buttons from ALL_BUTTONS, excluding those already clicked
  // For subsequent turns, pick 4 random buttons, but never in render (always in effect or callback)
  function getRandomButtons() {
    const unused = ALL_BUTTONS.filter(btn => !allClicked.has(btn.message));
    const shuffled = [...unused].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }

  // Handler for button click: send the message and record it
  const handleButtonClick = useCallback(
    (message: string) => {
      const newMessage = createMessageString(message);
      setClickedMessages(prev => [...prev, message]);
      // Store mapping from custom message to original label if different
      setCustomToOriginalMap(prev =>
        newMessage !== message
          ? { ...prev, [newMessage]: message }
          : prev
      );
      append({ role: 'user', content: newMessage });
      setInitialButtons([]); // Clear initial buttons after first click
    },
    [append]
  );

  const createMessageString = (message: string) => {
    if (message === 'What Are You Working On?') {
      return 'Mention that I am working on a full-stack AI marketing app.';
    }
    if (message === 'What Are Your Hobbies?') {
      return 'Talk about some of Jasons hobbies. They include: Brazilian Jiu Jitsu, Playing Chess, Reading Books, and Hiking.';
    }
    if (message === 'What Is Fun Fact?') {
      message = 'Mention this fact about Jason: '
      const funFacts = [
        'Jasons all time favorite movie is Interstellar.',
        'Jasons knees hurt because he has flat feet.',
        'Jason ran a half marathon when he was 15.',
        'Jason speaks Russian fluently.',
        'One time Jason competed in a lip-syncing battle and wore a Bon Jovi wig and sang "Livin on a Prayer".',
        'Jasons favorite coffee is a vanilla breve.',
      ];
      const randomIndex = Math.floor(Math.random() * funFacts.length);
      return message + funFacts[randomIndex];
    }
    if (message === 'Do You Have a Degree?') {
      return 'Mention that Jason has a degree in Computer Science from Washington State University.';
    }
    if (message === 'What Jobs Have You Worked?') {
      return 'Mention that Jason has a diverse working background that ranges from sales, to being a barista, to working construction, and being a full-stack software engineer.';
    }
    return message;
  };

  // Decide which buttons to show: AI-provided or random from pool
  // Only show buttons if not currently streaming/loading
  const showButtons = !isLoading;
  let buttonsToShow: typeof ALL_BUTTONS = [];
  const buttonPrompt = latestAIButtons?.text || (messages.length === 0 ? 'What Would You Like To Know?:' : 'Choose an option:');
  if (latestAIButtons) {
    buttonsToShow = latestAIButtons.buttons;
  } else if (messages.length === 0 && initialButtons.length > 0) {
    buttonsToShow = initialButtons;
  } else if (messages.length > 0) {
    buttonsToShow = getRandomButtons();
  }

  return (
    <>
      <HeroBanner
        photoSrc={headshot}
        photoAlt="Profile photo"
        heroTitle="Jason Kovalenko"
        heroSubtitle="Full-Stack Dev"
      />
      <div className="flex flex-col w-full max-w-md py-12 md:py-24 mx-auto stretch">
      {/* Chat history */}
      {messages.map((message: { id: string; role: string; content: string; }) => {
        let displayContent = message.content;
        if (message.role === 'user' && customToOriginalMap[message.content]) {
          displayContent = customToOriginalMap[message.content];
        }
        return (
          <div key={message.id} className="whitespace-pre-wrap mb-2 font-semibold text-white/90">
            {message.role === 'user' ? `User: ${displayContent}` : `Jason (AI): ${message.content}`}
          </div>
        );
      })}

      {/* Show 4 buttons (AI-provided or random) only when not streaming */}
      {showButtons && buttonsToShow.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 font-semibold">{buttonPrompt}</div>
          <div className="flex gap-2 flex-wrap">
            {buttonsToShow.map((btn: { label: string; message: string }, idx: number) => (
              <button
                key={btn.label + idx}
                className="px-4 py-2 bg-black text-white rounded-lg border border-black shadow hover:bg-white hover:text-black transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 cursor-pointer"
                onClick={() => handleButtonClick(btn.message)}
                type="button"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}