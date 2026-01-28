import React from 'react';
import { Twitter, Instagram, Youtube, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0b] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
             <h4 className="text-2xl font-display font-bold text-white mb-4 uppercase">Doutrina <span className="text-[#eeb32d]">CS</span></h4>
             <p className="text-gray-500 max-w-sm mb-6">
               A maior escola de Counter-Strike do Brasil. Formando jogadores de alta performance desde 2018.
             </p>
             <div className="flex space-x-4">
               <a href="#" className="text-gray-400 hover:text-[#eeb32d]"><Twitter size={20}/></a>
               <a href="#" className="text-gray-400 hover:text-[#eeb32d]"><Instagram size={20}/></a>
               <a href="#" className="text-gray-400 hover:text-[#eeb32d]"><Youtube size={20}/></a>
             </div>
          </div>
          
          <div>
            <h5 className="text-white font-bold uppercase mb-4">Plataforma</h5>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white">Login</a></li>
              <li><a href="#" className="hover:text-white">Criar Conta</a></li>
              <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold uppercase mb-4">Suporte</h5>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Contato</a></li>
              <li><a href="#" className="hover:text-white">Reembolso</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-12 pt-8 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Doutrina CS. Todos os direitos reservados. Counter-Strike é uma marca registrada da Valve Corporation.
        </div>
      </div>
    </footer>
  );
};

export default Footer;