import React, { useState, useEffect } from 'react';
import { calculateSubnet, generateSubnetHtml } from '../../utils/subnet';
import { X, Copy, Check, Plus, Calculator } from 'lucide-react';

interface SubnetCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIntoNote?: (html: string) => void;
}

export const SubnetCalculatorModal: React.FC<SubnetCalculatorModalProps> = ({
  isOpen,
  onClose,
  onInsertIntoNote,
}) => {
  const [ip, setIp] = useState('192.168.1.1');
  const [prefix, setPrefix] = useState(24);
  const [copied, setCopied] = useState(false);

  const result = calculateSubnet(ip, prefix);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!result) return;
    const text = `IP / CIDR:       ${result.ip}/${result.prefix}
Subnet Mask:     ${result.subnetMask}
Wildcard Mask:   ${result.wildcardMask}
Network Address: ${result.networkAddress}
Broadcast:       ${result.broadcastAddress}
Usable Range:    ${result.firstUsableIp} - ${result.lastUsableIp}
Usable Hosts:    ${result.usableHosts} (${result.totalAddresses} total)
Class:           ${result.ipClass} (${result.isPrivate ? 'RFC 1918 Private' : 'Public'})`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInsert = () => {
    if (!result || !onInsertIntoNote) return;
    onInsertIntoNote(generateSubnetHtml(result));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-gray-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
            <span className="font-semibold text-xs font-mono uppercase tracking-tight">
              CIDR / Subnet Calculator
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-4 space-y-3 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                IP Address
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.1"
                className="w-full text-xs font-mono px-3 py-1.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Prefix
              </label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(Number(e.target.value))}
                className="w-full text-xs font-mono px-2 py-1.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded focus:bg-white dark:focus:bg-zinc-900 focus:border-black dark:focus:border-zinc-500 focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 33 }, (_, i) => 32 - i).map((p) => (
                  <option key={p} value={p}>
                    /{p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Slider */}
          <div>
            <div className="flex justify-between text-[11px] text-gray-400 font-mono mb-1">
              <span>/8 (WAN/ISP)</span>
              <span className="font-semibold text-black dark:text-white">/{prefix}</span>
              <span>/30 (P2P)</span>
            </div>
            <input
              type="range"
              min={8}
              max={30}
              value={prefix}
              onChange={(e) => setPrefix(Number(e.target.value))}
              className="w-full accent-gray-900 dark:accent-zinc-100 cursor-pointer h-1.5 bg-gray-200 dark:bg-zinc-800 rounded"
            />
          </div>
        </div>

        {/* Calculated Results */}
        <div className="p-4 bg-gray-50/50 dark:bg-zinc-950/40 text-xs font-mono space-y-2">
          {result ? (
            <div className="divide-y divide-gray-100 dark:divide-zinc-800/80">
              <div className="grid grid-cols-2 py-1">
                <span className="text-gray-500 dark:text-zinc-400">Network ID:</span>
                <span className="font-semibold text-right">{result.networkAddress}</span>
              </div>
              <div className="grid grid-cols-2 py-1">
                <span className="text-gray-500 dark:text-zinc-400">Broadcast:</span>
                <span className="font-semibold text-right">{result.broadcastAddress}</span>
              </div>
              <div className="grid grid-cols-2 py-1">
                <span className="text-gray-500 dark:text-zinc-400">Usable Range:</span>
                <span className="text-right text-[11px]">
                  {result.firstUsableIp} - {result.lastUsableIp}
                </span>
              </div>
              <div className="grid grid-cols-2 py-1">
                <span className="text-gray-500 dark:text-zinc-400">Subnet Mask:</span>
                <span className="text-right">{result.subnetMask}</span>
              </div>
              <div className="grid grid-cols-2 py-1">
                <span className="text-gray-500 dark:text-zinc-400">Wildcard Mask (OSPF/ACL):</span>
                <span className="text-right font-medium text-gray-700 dark:text-zinc-300">
                  {result.wildcardMask}
                </span>
              </div>
              <div className="grid grid-cols-2 py-1">
                <span className="text-gray-500 dark:text-zinc-400">Usable Hosts:</span>
                <span className="font-semibold text-right">
                  {result.usableHosts.toLocaleString()}{' '}
                  <span className="text-gray-400 font-normal">({result.totalAddresses} total)</span>
                </span>
              </div>
              <div className="grid grid-cols-2 py-1">
                <span className="text-gray-500 dark:text-zinc-400">Type / Scope:</span>
                <span className="text-right">
                  {result.ipClass} •{' '}
                  <span className={result.isPrivate ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
                    {result.isPrivate ? 'RFC 1918 Private' : 'Public'}
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">Invalid IPv4 address format</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!result}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                <span className="font-medium text-black dark:text-white">Copied ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          {onInsertIntoNote && (
            <button
              type="button"
              onClick={handleInsert}
              disabled={!result}
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black rounded text-xs font-medium transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert Table into Note</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
