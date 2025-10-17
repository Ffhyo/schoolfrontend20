import { useState } from "react";

interface ApiRequest {
  message: string;
}

interface ApiResponse {
  reply: string;
  error?: string;
}
interface SuggestionContent {
  conduction: string;
  talentShow: string;
  speech: string;
  newsReading: string;
}
 
interface SuggestionState {
  conduction: string;
  talentShow: string;
  speech: string;
  newsReading: string;
  loading: {
    conduction: boolean;
    talentShow: boolean;
    speech: boolean;
    newsReading: boolean;
  };
}
const API_BASE_URL ='https://schoolbackend-un9x.onrender.com'

export default function TaskSuggestionCard() {
  const [suggestions, setSuggestions] = useState<SuggestionState>({
    conduction: "",
    talentShow: "",
    speech: "",
    newsReading: "",
    loading: {
      conduction: false,
      talentShow: false,
      speech: false,
      newsReading: false
    }
  });

  const [prompts, setPrompts] = useState ({
    conduction: "Generate a school morning assembly conduction script for students that includes prayer, thought of the day, news highlights, and motivational closing.",
    talentShow: "Suggest 5 creative talent show ideas suitable for school students with simple descriptions and required materials.",
    speech: "Write a 2-minute inspirational speech for school students about the importance of education and hard work.",
    newsReading: "Create a school assembly news reading script covering recent educational developments, sports achievements, and weather updates."
  });

  const callCustomAPI = async (userMessage: string): Promise<string> => {
    try {
      const requestBody: ApiRequest = {
        message: userMessage
      };

      const response = await fetch(`${API_BASE_URL}/api/chat/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status: ${response.status}. ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.reply;

    } catch (error) {
      console.error('Custom API Error:', error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  };

  const generateSuggestion = async (type: keyof SuggestionContent) => {
    setSuggestions(prev => ({
      ...prev,
      loading: { ...prev.loading, [type]: true }
    }));

    try {
      const prompt = prompts[type];
      const response = await callCustomAPI(prompt);
      
      setSuggestions(prev => ({
        ...prev,
        [type]: response,
        loading: { ...prev.loading, [type]: false }
      }));
    } catch (error) {
      setSuggestions(prev => ({
        ...prev,
        [type]: "Failed to generate content. Please try again.",
        loading: { ...prev.loading, [type]: false }
      }));
    }
  };

  const updatePrompt = (type: keyof typeof prompts, value: string) => {
    setPrompts(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
    alert("Copied to clipboard!");
  };

  const clearSuggestion = (type: keyof SuggestionState) => {
    setSuggestions(prev => ({
      ...prev,
      [type]: ""
    }));
  };

  return (
    <div className="mt-2 p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Assembly Activity Suggestions</h1>
        <p className="text-gray-600">AI-powered content generation for your assembly activities</p>
      </div>

      {/* Conduction Section */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-blue-600">🎤 Assembly Conduction</h1>
          <div className="flex gap-2">
            <button
              onClick={() => generateSuggestion('conduction')}
              disabled={suggestions.loading.conduction}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {suggestions.loading.conduction ? 'Generating...' : 'Generate Script'}
            </button>
            {suggestions.conduction && (
              <button
                onClick={() => clearSuggestion('conduction')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customize Prompt:
          </label>
          <textarea
            value={prompts.conduction}
            onChange={(e) => updatePrompt('conduction', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your custom prompt for conduction script..."
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
          {suggestions.conduction ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-gray-800">Generated Conduction Script</h2>
                <button
                  onClick={() => copyToClipboard(suggestions.conduction)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Copy
                </button>
              </div>
              <div className="whitespace-pre-wrap text-gray-700 bg-white p-4 rounded border">
                {suggestions.conduction}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Click "Generate Script" to create a conduction script for your assembly
            </p>
          )}
        </div>
      </div>

      {/* Talent Show Section */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-purple-600">🎭 Talent Show Ideas</h1>
          <div className="flex gap-2">
            <button
              onClick={() => generateSuggestion('talentShow')}
              disabled={suggestions.loading.talentShow}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300"
            >
              {suggestions.loading.talentShow ? 'Generating...' : 'Generate Ideas'}
            </button>
            {suggestions.talentShow && (
              <button
                onClick={() => clearSuggestion('talentShow')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customize Prompt:
          </label>
          <textarea
            value={prompts.talentShow}
            onChange={(e) => updatePrompt('talentShow', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your custom prompt for talent show ideas..."
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
          {suggestions.talentShow ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-gray-800">Talent Show Suggestions</h2>
                <button
                  onClick={() => copyToClipboard(suggestions.talentShow)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Copy
                </button>
              </div>
              <div className="whitespace-pre-wrap text-gray-700 bg-white p-4 rounded border">
                {suggestions.talentShow}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Click "Generate Ideas" to get creative talent show suggestions
            </p>
          )}
        </div>
      </div>

      {/* Speech Section */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-green-600">💬 Speech Script</h1>
          <div className="flex gap-2">
            <button
              onClick={() => generateSuggestion('speech')}
              disabled={suggestions.loading.speech}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {suggestions.loading.speech ? 'Generating...' : 'Generate Speech'}
            </button>
            {suggestions.speech && (
              <button
                onClick={() => clearSuggestion('speech')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customize Prompt:
          </label>
          <textarea
            value={prompts.speech}
            onChange={(e) => updatePrompt('speech', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your custom prompt for speech script..."
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
          {suggestions.speech ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-gray-800">Generated Speech</h2>
                <button
                  onClick={() => copyToClipboard(suggestions.speech)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Copy
                </button>
              </div>
              <div className="whitespace-pre-wrap text-gray-700 bg-white p-4 rounded border">
                {suggestions.speech}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Click "Generate Speech" to create an inspirational speech
            </p>
          )}
        </div>
      </div>

      {/* News Reading Section */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-orange-600">📰 News Reading Script</h1>
          <div className="flex gap-2">
            <button
              onClick={() => generateSuggestion('newsReading')}
              disabled={suggestions.loading.newsReading}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-orange-300"
            >
              {suggestions.loading.newsReading ? 'Generating...' : 'Generate News'}
            </button>
            {suggestions.newsReading && (
              <button
                onClick={() => clearSuggestion('newsReading')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customize Prompt:
          </label>
          <textarea
            value={prompts.newsReading}
            onChange={(e) => updatePrompt('newsReading', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your custom prompt for news reading script..."
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
          {suggestions.newsReading ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-gray-800">News Reading Script</h2>
                <button
                  onClick={() => copyToClipboard(suggestions.newsReading)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Copy
                </button>
              </div>
              <div className="whitespace-pre-wrap text-gray-700 bg-white p-4 rounded border">
                {suggestions.newsReading}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Click "Generate News" to create a news reading script
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Quick Actions</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              generateSuggestion('conduction');
              generateSuggestion('talentShow');
              generateSuggestion('speech');
              generateSuggestion('newsReading');
            }}
            disabled={Object.values(suggestions.loading).some(loading => loading)}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-indigo-300"
          >
            Generate All Content
          </button>
          <button
            onClick={() => {
              setSuggestions({
                conduction: "",
                talentShow: "",
                speech: "",
                newsReading: "",
                loading: {
                  conduction: false,
                  talentShow: false,
                  speech: false,
                  newsReading: false
                }
              });
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}